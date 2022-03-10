# Wattmeter-Forked

This is an updated version of the original Wattemeter extension for gnome-shell. See [https://bitbucket.org/blackBriar/wattmeter/src/master/](https://bitbucket.org/blackBriar/wattmeter/src/master/).

I created this fork because I really liked the original version and was quite sorry when it broke due to an update in Gnome APIs.

## What is it?
I display the current power (W) of your laptop when it is unplugged
When it is plugged, it will display 'Charging' or 'Full'.

## How to use it
```bash
    git clone https://github.com/clementherve/wattmeter-forked.git wattmeterforked
    gnome-extensions pack wattmeterforked --extra-source=panelLabel.js
    gnome-extensions install wattmeter-forked@clementherve.fr
    rm -rf wattmeterforked wattmeter-forked@clementherve.fr
```

## Troubleshooting

### It says 'Unknown'
By default, the extension read values from `/sys/class/power_supply/BAT0/...`. On some laptop brands, this path may vary (according to the doc here: [https://www.kernel.org/doc/Documentation/power/power_supply_class.txt](https://www.kernel.org/doc/Documentation/power/power_supply_class.txt)).
I plan on adding a configuration option to change the path. PR welcome!