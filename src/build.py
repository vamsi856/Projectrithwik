# Renders ../index.html from index.tpl.html. Edit the product lists below, then run: python3 src/build.py
# Product data comes straight from the Rithwik catalogue PDF.
import html
from pathlib import Path

HERE = Path(__file__).resolve().parent

# name, note, gst, (seed colour, shade colour, grain size px), group
BIRD = [
    ("Foxtail millet", "Summer crop, raw", "0%", ("#d9b24a", "#b48a2c", 7), "millets"),
    ("Foxtail millet", "Summer crop, cleaned", "0%", ("#e2bd55", "#bf9634", 7), "millets"),
    ("Foxtail millet", "Winter crop, raw", "0%", ("#cfa744", "#a98126", 7), "millets"),
    ("Foxtail millet", "Winter crop, cleaned", "0%", ("#dcb752", "#b58f30", 7), "millets"),
    ("Proso millet", "Raw", "0%", ("#e6d39a", "#c4ac68", 8), "millets"),
    ("Proso millet", "White, Sortex cleaned", "0%", ("#f1e7c6", "#d2c393", 8), "millets"),
    ("Ragi", "Finger millet", "0%", ("#8a3b2b", "#5e2216", 6), "millets"),
    ("Black sunflower", "Oil-type seed", "5%", ("#2c2a2a", "#4d4a47", 11), "oilseeds"),
    ("Sunflower SF-17", "Imported", "5%", ("#b9b3a6", "#56514b", 11), "oilseeds"),
    ("Safflower", "", "5%", ("#f2ede1", "#cfc6b0", 10), "oilseeds"),
    ("Pearl millet", "Bajra", "5%", ("#9aa197", "#6e776c", 8), "grains"),
    ("Jowar", "Nidi CH5, cleaned", "0%", ("#eadfc6", "#c7b896", 9), "grains"),
    ("Jowar", "Milky", "0%", ("#f2ead6", "#d3c6a6", 9), "grains"),
    ("Jowar", "Mahendra", "0%", ("#e4d4b0", "#bfa97c", 9), "grains"),
    ("White maize", "", "0%", ("#f0e4c4", "#cdbb8d", 12), "grains"),
    ("Horse gram", "", "0%", ("#8b5e3c", "#5f3c22", 9), "pulses"),
    ("Horse gram", "Raw", "0%", ("#94653f", "#674326", 9), "pulses"),
]
BIRD_GROUPS = [("all", "All feeds"), ("millets", "Millets"), ("oilseeds", "Sunflower & safflower"),
               ("grains", "Jowar, bajra & maize"), ("pulses", "Horse gram")]

MILLETS = [
    ("Foxtail millet", "0%", ("#d9b24a", "#b48a2c", 7)),
    ("Little millet", "0%", ("#d8c48a", "#b29e60", 6)),
    ("Kodo millet", "0%", ("#a9824e", "#7d5a2e", 7)),
    ("Barnyard millet", "0%", ("#e8dcb8", "#c6b78a", 7)),
    ("Proso millet", "0%", ("#e6d39a", "#c4ac68", 8)),
    ("Browntop millet", "0%", ("#c59a5a", "#996e34", 7)),
]
SEEDS = [
    ("Chia seeds", "White", "5%", ("#e9e4d8", "#bdb5a2", 5)),
    ("Flax seeds", "", "5%", ("#8a4a2c", "#5c2c16", 7)),
    ("Pumpkin seeds", "", "5%", ("#7f9a5a", "#556d36", 11)),
    ("Sunflower seeds", "", "5%", ("#d9d0bb", "#a99f86", 10)),
    ("Basil seeds", "", "5%", ("#2d2b2a", "#55514c", 5)),
    ("Safflower seeds", "", "5%", ("#f2ede1", "#cfc6b0", 10)),
    ("Sesame seeds", "Z-black", "5%", ("#262423", "#4a4542", 6)),
    ("Quinoa", "White", "0%", ("#efe5cc", "#cdbf9b", 6)),
    ("Quinoa", "Black", "0%", ("#3a302b", "#5e524b", 6)),
    ("Quinoa", "Red", "0%", ("#a3473a", "#76281e", 6)),
]
PANTRY = [
    ("Toor dal", "Raw", "5%", ("#e6b33c", "#bf8b1d", 9)),
    ("Chana dal", "", "5%", ("#e9c25a", "#c29a35", 9)),
    ("Lobia", "Black-eyed beans", "5%", ("#ece2cb", "#3b322b", 11)),
    ("Horse gram", "", "0%", ("#8b5e3c", "#5f3c22", 9)),
    ("Buckwheat", "", "0%", ("#a88d6a", "#7a6243", 9)),
    ("Clove", "Madagascar", "5%", ("#6b3a25", "#43200f", 9)),
    ("Clove", "Lalpari", "5%", ("#7a4026", "#4c2412", 9)),
    ("Bay leaf", "", "5%", ("#7c8a55", "#566238", 12)),
    ("Black chai", "", "5%", ("#3b2a22", "#5b4337", 5)),
]

e = html.escape


def seed(c):
    return f'<span class="seed" aria-hidden="true" style="--c1:{c[0]};--c2:{c[1]};--g:{c[2]}px"></span>'


def bird_rows():
    out = []
    for name, note, gst, c, grp in BIRD:
        q = e(f"{name}{' (' + note + ')' if note else ''}")
        out.append(
            f'<li class="feed" data-group="{grp}">{seed(c)}'
            f'<span class="feed__name">{e(name)}</span>'
            f'<span class="feed__note">{e(note)}</span>'
            f'<span class="feed__gst">GST {gst}</span>'
            f'<a class="feed__ask" href="#enquire" data-product="{q}" data-division="Rithwik Bird Feeds">Ask price</a></li>')
    return "\n            ".join(out)


def food_rows(items, with_note=True):
    out = []
    for it in items:
        if len(it) == 3:
            name, gst, c = it; note = ""
        else:
            name, note, gst, c = it
        q = e(f"{name}{' (' + note + ')' if note else ''}")
        out.append(
            f'<li class="food">{seed(c)}<span class="food__name">{e(name)}'
            f'{"<small>" + e(note) + "</small>" if note else ""}</span>'
            f'<span class="food__gst">GST {gst}</span>'
            f'<a class="food__ask" href="#enquire" data-product="{q}" data-division="Rithwik Industries">Ask price</a></li>')
    return "\n              ".join(out)


chips = "\n          ".join(
    f'<button class="chip{" is-on" if k == "all" else ""}" type="button" data-filter="{k}" aria-pressed="{"true" if k == "all" else "false"}">{e(v)}</button>'
    for k, v in BIRD_GROUPS)

options_bird = "".join(f'<option>{e(n + (" (" + no + ")" if no else ""))}</option>' for n, no, *_ in BIRD)
options_food = "".join(
    f'<option>{e(it[0] + (" (" + it[1] + ")" if len(it) == 4 and it[1] else ""))}</option>' for it in MILLETS + SEEDS + PANTRY)

tpl = (HERE / "index.tpl.html").read_text()
out = (tpl.replace("{{BIRD_ROWS}}", bird_rows())
          .replace("{{CHIPS}}", chips)
          .replace("{{MILLET_ROWS}}", food_rows(MILLETS))
          .replace("{{SEED_ROWS}}", food_rows(SEEDS))
          .replace("{{PANTRY_ROWS}}", food_rows(PANTRY))
          .replace("{{OPTIONS_BIRD}}", options_bird)
          .replace("{{OPTIONS_FOOD}}", options_food)
          .replace("{{N_BIRD}}", str(len(BIRD)))
          .replace("{{N_FOOD}}", str(len(MILLETS) + len(SEEDS) + len(PANTRY))))
(HERE.parent / "index.html").write_text(out)
print("ok", len(out))
