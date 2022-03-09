const PanelMenu = imports.ui.panelMenu;
const { St, Clutter, GObject } = imports.gi;


const WattmeterLabel = GObject.registerClass(
    class WattmeterLabel extends PanelMenu.Button {
        _init() {
            super._init(null, _('wattmeter-forked-indicator'));
            
            this.label = new St.Label({
                text: '(...)',
                y_align: Clutter.ActorAlign.CENTER
            });

            this.add_child(this.label);
        }
    });