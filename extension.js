// SPDX-License-Identifier: GPL-2.0-or-later
//
// Generated with AI for personal use.
// Do NOT upload to extensions.gnome.org (EGO) unless you understand JavaScript
// and can maintain this code.
//
// Week HP: barra de vida estilo videojuego 2D de plataformas en la barra superior
// de GNOME Shell (45+). Se llena de lunes a viernes; al terminar el viernes se
// cumplen las metas de la semana.

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {WeekHpIndicator} from './indicator.js';

export default class WeekHpExtension extends Extension {
    enable() {
        this._indicator = new WeekHpIndicator(this.metadata.name, this.dir.get_child('icons'));
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}
