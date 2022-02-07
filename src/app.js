import * as vl from "vega-lite-api";
import { Handler } from "vega-tooltip";

const world = require("./data/world-countries.json");
const brazil = require("./data/br-states.json");

const focos = vl.csv("data/Focos_BDQueimadas.csv");
const globalTemp = vl.csv("data/GlobalLandTemperaturesByCountry_drop.csv");

vl.register(vega, vegaLite, {
  view: { renderer: "svg" },
  init: (view) => {
    view.tooltip(new Handler().call);
  },
});

const globalConfig = {
  background: null,
  axis: {
    domainColor: "#ffffff",
    gridColor: "#dedede",
    titleColor: "#ffffff",
    labelColor: "#dedede",
    tickColor: "#cecece",
  },
  legend: {
    labelColor: "#ffffff",
    titleColor: "#ffffff",
  },
};

const firesPerBiome = vl
  .markLine()
  .data(focos)
  .transform(vl.filter("datum.bioma !== ''"))
  .encode(
    vl.x().title("Ano").fieldT("datahora").timeUnit("year"),
    vl.y().title("Bioma").count(),
    vl.color().fieldN("bioma").title(null)
  );

const tempVariation = () => {
  const yearlyAvgTemp = vl
    .markRect()
    .config(globalConfig)
    .data(globalTemp)
    .encode(
      vl.x().title("Ano").timeUnit("year").fieldO("dt"),
      vl.y().title("Temperatura").fieldQ("AverageTemperature"),
      vl
        .color()
        .title("Temperatura")
        .fieldQ("AverageTemperature")
        .scale({
          domain: [-40, 40],
          type: "quantize",
          clamp: true,
          scheme: { name: "inferno", count: 20 },
        })
    )
    .width(800)
    .height(300);

  const tempUncertainty = vl
    .markPoint()
    .data(globalTemp)
    .transform(vl.filter("datum.AverageTemperatureUncertainty > 4"))
    .encode(
      vl.x().title("Incerteza").fieldQ("AverageTemperatureUncertainty"),
      vl.y().title("Temperatura média").fieldQ("AverageTemperature"),
      vl
        .color()
        .fieldQ("AverageTemperatureUncertainty")
        .scale({
          domain: [0, 8],
          type: "quantize",
          clamp: true,
          scheme: { name: "lightmulti", count: 10 },
        })
    );

  return vl
    .hconcat(yearlyAvgTemp, tempUncertainty)
    .config(globalConfig)
    .resolve({ scale: { size: "independent" } });
};

const firesByStateMap = () => {
  const barChart = vl
    .markBar()
    .config(globalConfig)
    .data(focos)
    .encode(
      vl.y().sort("-x").title("Estado").fieldN("estado"),
      vl.x().title("Queimadas").count(),
      vl.tooltip().fieldN("estado").count(),
      vl
        .color()
        .count()
        .title("Queimadas")
        .fieldN("estado")
        .scale({
          type: "quantize",
          clamp: true,
          scheme: { name: "yelloworangered", count: 2000 },
        })
    )
    .width(400)
    .height(400);

  const map = vl
    .markGeoshape({ stroke: "#888", strokeWidth: 0.25 })
    .config(globalConfig)
    .data(vl.topojson(brazil).feature("estados"))
    .project(vl.projection("mercator"))
    .transform(
      vl
        .lookup("id")
        .from(vl.data(focos).key("estado").fields("estado", "bioma"))
    )
    .encode(
      vl.text(vl.fieldN("properties.name")),
      vl
        .color()
        .fieldN("estado")
        .aggregate(vl.count())
        .scale({
          type: "quantize",
          clamp: true,
          scheme: { name: "yelloworangered", count: 2000 },
        }),
      vl.tooltip(["estado", "bioma"])
    )
    .width(400)
    .height(400);

  return vl
    .hconcat(map, barChart)
    .config(globalConfig)
    .resolve({ scale: { size: "independent" } });
};

const run = async (id, obj) => {
  const element = document.getElementById(id);
  obj.background(null);
  element.replaceWith(await obj.render());
};

run("yearly-temp", tempVariation());
run("biome-fire", firesPerBiome);
run("brazil-map", firesByStateMap());
