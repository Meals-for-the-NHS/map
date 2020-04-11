<template>
    <gmap-map class="map" ref="map" :center="map.center"
              :zoom="map.zoom" :options="map.options">
    <gmap-marker v-for="provider in providers" :key="provider.record_id"
                 :position="provider.coordinates"
                 :icon="currentPlace && provider.record_id === currentPlace.record_id ? currentIcon : Object.assign({}, providerIcon, { fillColor: colours[provider.Status] })"
                 @click="$emit('providerClick', provider.record_id)" />

    <gmap-marker v-for="hospital in hospitals" :key="hospital.record_id"
                 :position="hospital.coordinates"
                 :icon="currentPlace && hospital.record_id === currentPlace.record_id ? currentIcon : Object.assign({}, hospitalIcon, { fillColor: colours[hospital.Status] })"
                 @click="$emit('hospitalClick', hospital.record_id)" />
  </gmap-map>
</template>

<script>
import { gmapApi } from 'vue2-google-maps'

export default {
  name: 'place-map',
  props: {
    providers: {
      type: Array,
      default: () => []
    },
    hospitals: {
      type: Array,
      default: () => []
    },
    currentPlace: {
      type: Object,
      default: null
    },
    loaded: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      map: {
        center: {
          lat: 53.021722, lng: -2.129872
        },
        zoom: 7,
        options: {
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          styles: [
            {
              stylers: [
                {
                  saturation: -100
                }
              ]
            },
            {
              featureType: 'road',
              elementType: 'labels',
              stylers: [
                { visibility: 'off' }
              ]
            }
          ]
        }
      },
      colours: {
        'Not started': '#7963bf',
        Receiving: '#22b346',
        Contacted: '#1286c9',
        'Waiting for first order': '#19a68a',
        Delivering: '#22b346',
        Onboarded: '#4488aa',
        'Priority to respond to': '#ffe554',
        'Priority for outreach': '#e075d2',
        'Waitlist for response': '#f29366'
      }
    }
  },
  watch: {
    google(g) {
      if (g && !this.loaded) {
        this.$emit('load')
      }
    }
  },
  computed: {
    google: gmapApi,
    providerIcon() {
      return {
        path: this.google.maps.SymbolPath.CIRCLE,
        fillColor: '#0af',
        fillOpacity: 1,
        scale: 5,
        strokeColor: '#fff',
        strokeWeight: 1.5
      }
    },
    hospitalIcon() {
      return {
        path: 'M-3,-3 -1,-3 -1,-1 1,-1 1,-3 3,-3 3,3 1,3 1,1 -1,1 -1,3 -3,3Z',
        scale: 3,
        fillOpacity: 1,
        strokeColor: '#888',
        strokeWeight: 0.5
      }
    },
    currentIcon() {
      const icon = Object.assign({}, this.providerIcon)
      icon.fillColor = '#fc0'
      icon.scale = 11
      icon.strokeWeight = 3
      return icon
    }
  },
  methods: {
    panTo(coords) {
      this.$refs.map.panTo(coords)
      this.map.zoom = 10
    }
  }
}
</script>
