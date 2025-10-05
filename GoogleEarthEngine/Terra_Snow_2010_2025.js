// Define Sierra Nevada bounding box
var sierra = ee.Geometry.Rectangle([-123.0, 35.0, -117.0, 41.0]);

// Helper function to get blended image for a given month/year
function getMonthlyComposite(year, month) {
  var start = ee.Date.fromYMD(year, month, 1);
  var end = start.advance(1, 'month');
  
  // MODIS true color composite
  var modisTrueColor = ee.ImageCollection('MODIS/061/MOD09GA')
    .filter(ee.Filter.date(start, end))
    .select(['sur_refl_b01', 'sur_refl_b04', 'sur_refl_b03'])
    .map(function(img) { return img.clip(sierra); })
    .median()
    .visualize({
      min: 500,
      max: 3000,
      bands: ['sur_refl_b01', 'sur_refl_b04', 'sur_refl_b03']
    });
  
  // MODIS snow cover composite
  var snowIC = ee.ImageCollection('MODIS/061/MOD10A1')
    .filter(ee.Filter.date(start, end))
    .select('NDSI_Snow_Cover')
    .map(function(img) { return img.clip(sierra); });
  var snowMedian = snowIC.median().visualize({
    min: 50,
    max: 100,
    opacity: 0.6,
    palette: ['ffffff']
  });
  
  // Blend snow over true color
  var display = modisTrueColor.blend(snowMedian);
  return display.set('year', year).set('month', month);
}

// Create lists of years and months
var years_months = [
  [2010, 1],[2010, 2],[2010, 3],[2010, 4],[2010, 5],[2010, 6],
  [2025, 1],[2025, 2],[2025, 3],[2025, 4],[2025, 5],[2025, 6]
];

// Generate all composites
years_months.forEach(function(ym) {
  var img = getMonthlyComposite(ym[0], ym[1]);
  var label = 'Snow & True Color ' + ym[0] + '-' + ym[1];
  Map.addLayer(img, {}, label);
  
    Export.image.toDrive({
    image: img,
    description: 'SierraNevada_Snow_TrueColor_' + ym[0] + '_' + ym[1],
    folder: 'EarthEngineExports',   
    scale: 500,
    region: sierra,
    fileFormat: 'GeoTIFF',
    maxPixels: 1e13
  });
});
