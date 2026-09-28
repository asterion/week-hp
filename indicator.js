// SPDX-License-Identifier: GPL-2.0-or-later
//
// Generated with AI for personal use.
// Do NOT upload to extensions.gnome.org (EGO) unless you understand JavaScript
// and can maintain this code.

import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

import {WORK_DAYS, getWeekProgress} from './weekProgress.js';

// Debe coincidir con el ancho de .week-hp-segment
const SEGMENT_WIDTH = 14;
const UPDATE_INTERVAL_S = 60;

export const WeekHpIndicator = GObject.registerClass(
class WeekHpIndicator extends PanelMenu.Button {
    _init(name, iconsDir) {
        super._init(0.0, name, true);

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
        this._heartIcon = new Gio.FileIcon({file: iconsDir.get_child('heart-symbolic.svg')});
        this._starIcon = new Gio.FileIcon({file: iconsDir.get_child('star-symbolic.svg')});

        const box = new St.BoxLayout({
            style_class: 'week-hp-box',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this.add_child(box);

        this._icon = new St.Icon({
            style_class: 'week-hp-icon',
            y_align: Clutter.ActorAlign.CENTER,
        });
        box.add_child(this._icon);

        // Un segmento por día laborable, con un relleno de ancho variable dentro
        const frame = new St.BoxLayout({
            style_class: 'week-hp-frame',
            y_align: Clutter.ActorAlign.CENTER,
        });
        box.add_child(frame);

        this._fills = Array.from({length: WORK_DAYS}, () => {
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

        this._update();
        this._timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, UPDATE_INTERVAL_S, () => {
            this._update();
            return GLib.SOURCE_CONTINUE;
        });
    }

    _update() {
        const {days, today, total} = getWeekProgress(GLib.DateTime.new_now_local());
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

        if (complete) {
            this._label.text = _('GOAL!');
        } else {
            // Translators: weekday and week progress, e.g. "Wed 46%"
            this._label.text = _('%s %d%%').format(this._dayNames[today], Math.floor(total * 100));
        }

        this._icon.gicon = complete ? this._starIcon : this._heartIcon;
        this._icon.style_class = complete ? 'week-hp-icon complete' : 'week-hp-icon';
        this._label.style_class = complete ? 'week-hp-label complete' : 'week-hp-label';
    }

    destroy() {
        GLib.Source.remove(this._timeoutId);
        this._timeoutId = 0;

        this._fills = null;
        this._icon = null;
        this._label = null;
        this._heartIcon = null;
        this._starIcon = null;
        this._dayNames = null;

        super.destroy();
    }
});
