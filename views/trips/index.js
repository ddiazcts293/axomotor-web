import './style.css';
import GeoJSON from 'ol/format/GeoJSON';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Link from 'ol/interaction/Link';
import {Style, Fill, Stroke} from 'ol/style';

export function init(extraData, dataStore) {
    console.log('Inicializando página de viajes...');
    
    const map = new Map({
        target: 'map',
        layers: [
            new TileLayer({
                source: new OSM()
            }),
        ],
        view: new View({
            center: [0, 0],
            zoom: 2
        })
    });
    
    map.addLayer(
        new VectorLayer({
            source: new VectorSource({
                format: new GeoJSON(),
                url: './data/route.json',
            }),
            style: new Style({
                stroke: new Stroke({
                    color: 'red',
                    width: 4
                })
            })
        })
    );
    
    map.addInteraction(new Link());
}

export function cleanUp() {
    console.log('Finalizando página de viajes');
}
