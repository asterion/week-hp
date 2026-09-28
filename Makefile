UUID = week-hp@asterion
DOMAIN = week-hp
LANGS = $(basename $(notdir $(wildcard po/*.po)))
MO_FILES = $(foreach l,$(LANGS),locale/$(l)/LC_MESSAGES/$(DOMAIN).mo)

.PHONY: all pot pack clean

# Compila las traducciones (necesario al trabajar con el enlace simbólico)
all: $(MO_FILES)

locale/%/LC_MESSAGES/$(DOMAIN).mo: po/%.po
	mkdir -p $(dir $@)
	msgfmt --check -o $@ $<

# Regenera la plantilla y actualiza los .po con los textos nuevos
pot:
	xgettext --from-code=UTF-8 --language=JavaScript --add-comments=Translators \
		--keyword=_ --package-name=$(DOMAIN) -o po/$(DOMAIN).pot *.js
	for po in po/*.po; do msgmerge --update --backup=none $$po po/$(DOMAIN).pot; done

# Zip listo para extensions.gnome.org (compila los .po por su cuenta)
pack:
	gnome-extensions pack --force --podir=po \
		--extra-source=indicator.js --extra-source=weekProgress.js --extra-source=icons --extra-source=LICENSE .

clean:
	rm -rf locale $(UUID).shell-extension.zip
