/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { WattmeterLabel } = Me.imports.panelLabel;

const { GLib }  = imports.gi;
const Shell = imports.gi.Shell;
const Lang = imports.lang;
const Main = imports.ui.main;

const VOLTAGE_NOW = "/sys/class/power_supply/BAT0/voltage_now";
const CURRENT_NOW = "/sys/class/power_supply/BAT0/current_now";
const STATUS = "/sys/class/power_supply/BAT0/status";

const PREFER_INSTANT_CONSUMPTION = true;
const HISTORY_SIZE = 100; // power consumption history over the past 100 * 30 seconds
const REFRESH_INTERVAL = 15; // seconds


class WattmeterExtension {
    constructor() {}

    enable() {
        this.historicPower = [];
        this.instantPower = NaN;
        this._wattmeterLabel = new WattmeterLabel();

        this._measureTimeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, REFRESH_INTERVAL, Lang.bind(this, this._measure));

        this._measure();
        
        Main.panel.addToStatusArea('wattmeter-forked', this._wattmeterLabel);
    }

    _measure() {
        this.lastStatus = this._getStatus().trim();
        if (this.lastStatus !== 'Discharging') {
            this.historicPower = [];
            this.instantPower = NaN;
            return this._refreshUI();
        }

        const current = this._getCurrent();
        const voltage = this._getVoltage();

        if (current < 0 || voltage < 0) {
            this.historicPower = [];
            this.instantPower = NaN;
            return this._refreshUI();
        }

        this.instantPower = current * voltage;
        this.historicPower.push(this.instantPower);
        if (this.historicPower.length >= HISTORY_SIZE) {
            this.historicPower.shift();
        }
        
        return this._refreshUI();
    }

    _refreshUI() {
        let power_text = '';

        if (this.historicPower.length < 1) {
            power_text = this.lastStatus != null ? this.lastStatus : 'N/A';
        } else {
            const avg = PREFER_INSTANT_CONSUMPTION 
                ? this.instantPower 
                : this.historicPower.reduce((acc, elem) => acc + elem, 0.0) / this.historicPower.length;
            power_text = `${avg.toFixed(2)}W`;
        }
        
        if (this._wattmeterLabel.label != undefined)
            this._wattmeterLabel.label.set_text(power_text);
        
        return true;
    }

    _getStatus() {
        return this._readFileSafely(STATUS, "Unknown");
    }

    _getVoltage() {
        const voltage = parseFloat(this._readFileSafely(VOLTAGE_NOW, -1));
        return voltage === -1 ? voltage : voltage / 1000000;
    }

    _getCurrent() {
        const current = parseFloat(this._readFileSafely(CURRENT_NOW, -1));
        return current === -1 ? current : current / 1000000;
    }

    _readFileSafely(filePath, defaultValue) {
        try {
            return Shell.get_file_contents_utf8_sync(filePath);
        } catch (e) {
            log(`Cannot read file ${filePath}`, e);
        }
        return defaultValue;
    }

    disable() {
        if (this._wattmeterLabel) {
            this._wattmeterLabel.destroy();
            this._wattmeterLabel = null;
        }
        
        GLib.source_remove(this.interval);
        this.interval = null;
    }
}


// Shell entry point
function init(meta) {
    // return new WattmeterExtension();
    return new WattmeterExtension();
}
// function enable() {
//     // Create objects, connect signals, create timeout sources, etc.
//     new WattmeterExtension();
// }