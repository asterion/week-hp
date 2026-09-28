// SPDX-License-Identifier: GPL-2.0-or-later
//
// Week HP: barra de vida estilo videojuego 2D de plataformas en la barra superior
// de GNOME Shell (45+). Se llena de lunes a viernes; al terminar el viernes se
// cumplen las metas de la semana.

import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

// De lunes a viernes
const WORK_DAYS = 5;

// Horario de la jornada: fuera de él el día cuenta vacío (antes) o lleno (después).
// Con 0 y 24 cada día avanza durante las 24 horas.
const DAY_START_HOUR = 9;
const DAY_END_HOUR = 18;

// Ancho interior de cada segmento; debe coincidir con .week-hp-segment
const SEGMENT_WIDTH = 14;
const UPDATE_INTERVAL_S = 60;

export default class WeekHpExtension extends Extension {
    enable() {
        // Los textos se traducen aquí: gettext solo funciona con la extensión ya cargada
        this._dayNames = [
            // Translators: abbreviated weekday shown in the top bar
            _('Mon'),
            // Translators: abbreviated weekday shown in the top bar
            _('Tue'),
            // Translators: abbreviated weekday shown in the top bar
            _('Wed'),
            // Translators: abbreviated weekday shown in the top bar
            _('Thu'),
            // Translators: abbreviated weekday shown in the top bar
            _('Fri'),
        ];

        this._indicator = new PanelMenu.Button(0.0, this.metadata.name, true);

        const box = new St.BoxLayout({
            style_class: 'week-hp-box',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._indicator.add_child(box);

        box.add_child(new St.Label({
            text: '♥',
            style_class: 'week-hp-tag',
            y_align: Clutter.ActorAlign.CENTER,
        }));

        // Un segmento por día laborable, con un relleno de ancho variable dentro
        const frame = new St.BoxLayout({
            style_class: 'week-hp-frame',
            y_align: Clutter.ActorAlign.CENTER,
        });
        box.add_child(frame);

        this._fills = this._dayNames.map(() => {
            const segment = new St.Widget({style_class: 'week-hp-segment'});
            const fill = new St.Widget({style_class: 'week-hp-fill'});
            segment.add_child(fill);
            frame.add_child(segment);
            return fill;
        });

        this._label = new St.Label({
            style_class: 'week-hp-label',
            y_align: Clutter.ActorAlign.CENTER,
        });
        box.add_child(this._label);

        Main.panel.addToStatusArea(this.uuid, this._indicator);

        this._update();
        this._timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, UPDATE_INTERVAL_S, () => {
            this._update();
            return GLib.SOURCE_CONTINUE;
        });
    }

    // Devuelve el avance de cada día (0..1) y el día actual (null en fin de semana)
    _getWeekProgress() {
        const now = GLib.DateTime.new_now_local();
        const weekday = now.get_day_of_week() - 1; // 0 = lunes … 6 = domingo

        if (weekday >= WORK_DAYS)
            return {days: Array(WORK_DAYS).fill(1), today: null};

        const hours = now.get_hour() + now.get_minute() / 60;
        const todayFraction = Math.min(Math.max(
            (hours - DAY_START_HOUR) / (DAY_END_HOUR - DAY_START_HOUR), 0), 1);

        const days = Array.from({length: WORK_DAYS}, (_v, i) => {
            if (i < weekday)
                return 1;
            return i === weekday ? todayFraction : 0;
        });
        return {days, today: weekday};
    }

    _update() {
        const {days, today} = this._getWeekProgress();
        const total = days.reduce((sum, d) => sum + d, 0) / WORK_DAYS;
        const complete = total >= 1;

        // Como en los juegos: rojo con poca vida, amarillo a media, verde casi llena
        let level = '';
        if (complete)
            level = 'complete';
        else if (total >= 0.8)
            level = 'high';
        else if (total >= 0.4)
            level = 'mid';

        this._fills.forEach((fill, i) => {
            fill.width = Math.round(SEGMENT_WIDTH * days[i]);
            fill.style_class = `week-hp-fill ${level}`;
        });

        const percent = Math.floor(total * 100);
        if (complete) {
            this._label.text = _('★ GOAL!');
        } else {
            // Translators: weekday and week progress, e.g. "Wed 46%"
            this._label.text = _('%s %d%%').format(this._dayNames[today], percent);
        }
        this._label.style_class = complete ? 'week-hp-label complete' : 'week-hp-label';
    }

    disable() {
        if (this._timeoutId) {
            GLib.source_remove(this._timeoutId);
            this._timeoutId = 0;
        }

        // Destruir el indicador también lo quita del panel
        this._indicator?.destroy();
        this._indicator = null;
        this._fills = null;
        this._dayNames = null;
        this._label = null;
    }
}
