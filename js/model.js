/**
 * @file
 * Contains data (model) needed for this project. It is the ONLY point where you should change data 
 * about cities, which are shown on the map.
 *
 * @author
 * Vladimir Vorotnikov
 * v.s.vorotnikov@gmail.com
 *
 */

'use strict';

var mapData = {

    mapCenter : {
        position : {
            lat : 56.236575,
            lng : 37.909103
        },
        zoom : 7
    },

    markers : [
        {
            position : {lat: 56.307, lng : 38.150},
            title : 'Sergiyev Posad',
            icon : 'dst/images/sergievposad.png'
        },
        {
            position : { lat: 56.165, lng : 40.402},
            title : 'Vladimir',
            icon : 'dst/images/vladimir.png'
        },
        {
            position : { lat: 56.416, lng : 40.453},
            title : 'Suzdal',
            icon : 'dst/images/suzdal.png'
        },
        {
            position : { lat: 56.736, lng : 38.882},
            title : 'Pereslavl-Zalessky',
            icon : 'dst/images/pereslavl.png'
        },
        {
            position : { lat: 57.633, lng : 39.855},
            title : 'Yaroslavl',
            icon : 'dst/images/yaroslavl.png'
        },
        {
            position : { lat: 57.186, lng : 39.411},
            title : 'Rostov',
            icon : 'dst/images/rostov.png'
        },
        {
            position : { lat: 57.765, lng : 40.925},
            title : 'Kostroma',
            icon : 'dst/images/kostroma.png'
        }
    ]
};


