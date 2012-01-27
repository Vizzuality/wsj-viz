java -jar lib/compiler.jar --js=src/cartoshader.js --js=src/gmaps_mercator.js --js=src/canvas_tile_layer.js --js=src/cartodb_vector.js --js=src/GeoJSON.js --js=src/cartoinfowin.js --js=src/wax.g.js --compilation_level=WHITESPACE_ONLY --js_output_file=build/app_base.js
java -jar lib/compiler.jar --js=src/app_mobile.js --js_output_file=build/app_mobile.js
java -jar lib/compiler.jar --js=src/cartodb-gmapsv3.js --js_output_file=build/cartodb-gmapsv3.js
java -jar lib/compiler.jar --js=src/app.js --js_output_file=build/app.js
