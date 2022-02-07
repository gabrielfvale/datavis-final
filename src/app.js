import * as vl from "vega-lite-api";
import { Handler } from "vega-tooltip";

const world = require("./data/world-countries.json");
const brazil = require("./data/br-states.json");

const focos = vl.csv("data/Focos_BDQueimadas.csv");

vl.register(vega, vegaLite, {
  view: { renderer: "svg" },
  init: (view) => {
    view.tooltip(new Handler().call);
  },
});

const queimadasPorEstado = vl
  .markBar()
  .background(null)
  .data(focos)
  .encode(vl.y().fieldN("estado"), vl.x().count(), vl.tooltip(["bioma"]))
  .width(400)
  .height(400);

const queimadasPorEstadoMapa = () => {
  const map = vl
    .markGeoshape({ stroke: "#888", strokeWidth: 0.25 })
    .data(vl.topojson(brazil).feature("estados"))
    .transform(
      vl
        .lookup("id")
        .from(vl.data(focos).key("estado").fields("estado", "bioma"))
    )
    .encode(
      vl
        .color()
        .fieldN("estado")
        .aggregate(vl.count())
        .scale({
          type: "quantize",
          clamp: true,
          scheme: { name: "yelloworangered", count: 2000 },
        }),
      vl.tooltip(["bioma"])
    );

  return vl
    .layer(map)
    .background(null)
    .project(vl.projection("mercator"))
    .width(400)
    .height(400);
};

const run = async (id, obj) => {
  const element = document.getElementById(id);
  obj.background(null);
  element.replaceWith(await obj.render());
};

run("world-map", queimadasPorEstadoMapa());
run("world-map2", queimadasPorEstado);
