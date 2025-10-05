// Define study region (Sierra Nevada)
var region = ee.Geometry.Rectangle([-123.0, 35.0, -117.0, 41.0]);

// Years to analyze
var years = ee.List.sequence(2010, 2025);

// Function to get April snow depth for each year
var aprilSnowDepth = years.map(function(year) {
  var start = ee.Date.fromYMD(year, 4, 1);
  var end = ee.Date.fromYMD(year, 4, 30);
  // MODIS Terra Snow Cover Daily Global 500m (MOD10A1)
  var snowIC = ee.ImageCollection('MODIS/061/MOD10A1')
    .filterDate(start, end)
    .select('NDSI_Snow_Cover')
    .map(function(img) {
      return img.clip(region);
    });
  // Median April snow cover for the year
  var aprilMedian = snowIC.median()
    .set('year', year);
  return aprilMedian;
});

// Convert to ImageCollection
var aprilSnowIC = ee.ImageCollection(aprilSnowDepth);

// Reduce to region mean for each year
var aprilMeans = aprilSnowIC.map(function(img) {
  var year = img.get('year');
  // Mean snow cover fraction in region
  var meanSnow = img.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: region,
    scale: 500,
    maxPixels: 1e9
  }).set('year', year);
  return ee.Feature(null, meanSnow);
});
var aprilSnowTable = ee.FeatureCollection(aprilMeans);

// Print table of mean April snow cover per year
print(aprilSnowTable);

// Export as CSV for Python modeling
Export.table.toDrive({
  collection: aprilSnowTable,
  description: 'April_Mean_SnowCover_2010_2025',
  fileFormat: 'CSV'
});
