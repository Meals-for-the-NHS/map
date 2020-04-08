<template lang="html">
<div class="locations">
  <gmap-map class="map" ref="map" :center="map.center"
  :zoom="map.zoom" :options="map.options">
    <gmap-marker v-for="provider in filteredProviders" :key="provider.record_id"
                 :position="provider.coordinates"
                 :icon="Object.assign({}, providerIcon, { fillColor: colours[provider.Status] })"
                 @click="selectProvider(provider.record_id)" />

    <gmap-marker v-for="hospital in filteredHospitals" :key="hospital.record_id"
                 :position="hospital.coordinates"
                 :icon="Object.assign({}, hostpitalIcon, { fillColor: colours[hospital.Status] })"
                 @click="selectHospital(hospital.record_id)" />
  </gmap-map>
  <div class="sidebar">
    <div class="selection">
      <h2>Hospitals</h2>
      <ul>
        <li v-for="(value, filter) in hospitalFilters" :key="`hs-${filter}`">
          <input type="checkbox" :checked="value"
                 @change="changeHospitalFilter(filter, $event.target.checked)">
          <svg width="20px" height="20px">
            <g transform="scale(3) translate(3, 3) ">
              <path :d="hostpitalIcon.path" :fill="colours[filter]"/>
            </g>
          </svg>
          {{ filter }}
        </li>
      </ul>
      <h2>Providers</h2>
      <ul>
        <li v-for="(value, filter) in providerFilters" :key="`pr-${filter}`">
          <input type="checkbox" :checked="value"
                 @change="changeProviderFilter(filter, $event.target.checked)">
         <div class="circle" :style="{ background: colours[filter]}"></div>
          {{ filter }}
        </li>
      </ul>
    </div>
    <div v-if="currentPlace" class="current-place">
      <span class="close">
        <router-link :to="{ name: 'map' }">&times;</router-link>
      </span>
      <div v-if="type === 'hospital'" class="place-info">
        <h2>{{ currentPlace['Hospital Name'] }}</h2>
        <h3>{{ currentPlace['City'] }}</h3>
        <h4>{{ currentPlace['Region'] }}</h4>
        <p>{{ currentPlace['Status'] }}</p>
      </div>
      <div v-else-if="type === 'provider'" class="place-info">
        <h2>{{ currentPlace['Restaurant Name'] }}</h2>
        <h3>{{ currentPlace['Cuisine'] }}</h3>
        <table>
          <tbody>
            <tr v-for="key in providerTableKeys" :key="`prov-${key}`">
              <td>{{ key }}</td>
              <td>{{ currentPlace[key]}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { gmapApi } from 'vue2-google-maps'
import { mapState, mapActions } from 'vuex'

export default {
  props: {
    type: {
      type: String,
      default: 'hospital'
    },
    pid: {
      type: String,
      default: null
    },
    moveMap: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loaded: false,
      map: {
        center: {
          lat: 53.021722, lng: -2.129872
        },
        zoom: 7,
        options: {
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          styles: [
            { stylers: [{ saturation: -100 }] }
          ]
        }
      },
      closestProviders: [],
      hospitalFilter: '',
      hospitalFilterReceiving: false,
      providerTableKeys: [
        'Status', 'Location', 'Restaurant City', 'Meal number'
      ],
      hospitalFilters: {},
      providerFilters: {},
      colours: {
        'Not started': '#ff7cac',
        'Not started (priority to contact)': '#ffe54c',
        Receiving: '#7fff4c',
        Contacted: '#4caa92',
        'Waiting for first order': '#4cb2ff',
        None: '#7f4cff',
        Delivering: '#ff4ce5',
        Onboarded: '#4488aa'
      }
    }
  },
  watch: {
    google(g) {
      if (g && !this.loaded) {
        this.load()
      }
    },
    pid() {
      this.grabClosest()
      if (this.moveMap && this.type === 'hospital') {
        this.$refs.map.panTo(this.currentPlace.pos)
      }
    },
    currentPlace() {
      if (this.currentPlace) {
        this.grabClosest()
      }
    },
    hospitals() {
      if (this.hospitals) {
        this.hospitalFilters = this.statuses(this.hospitals)
      }
    },
    providers() {
      if (this.providers) {
        this.providerFilters = this.statuses(this.providers)
      }
    }
  },
  computed: {
    ...mapState(['hospitals', 'providers']),
    google: gmapApi,
    providerIcon() {
      return {
        path: this.google.maps.SymbolPath.CIRCLE, // 'M-1,-1 1,-1 1,1 -1,1Z',
        fillColor: '#0af',
        fillOpacity: 1,
        scale: 5,
        strokeColor: '#888',
        strokeWeight: 0.5
      }
    },
    hostpitalIcon() {
      const icon = Object.assign({}, this.providerIcon)
      icon.path = 'M-3,-3 -1,-3 -1,-1 1,-1 1,-3 3,-3 3,3 1,3 1,1 -1,1 -1,3 -3,3Z'
      icon.fillColor = '#f0a'
      icon.scale = 3
      return icon
    },
    filteredHospitals() {
      if (this.hospitals) {
        return Object.values(this.hospitals)
          .filter(h => this.hospitalFilters[h.Status])
      }
      return []
    },
    filteredProviders() {
      if (this.providers) {
        return Object.values(this.providers)
          .filter(p => this.providerFilters[p.Status])
      }
      return []
    },
    currentPlace() {
      if (this.pid && this.hospitals && this.providers) {
        return this[`${this.type}s`][this.pid]
      }
      return null
    }
  },
  methods: {
    ...mapActions(['load']),
    selectHospital(id) {
      this.$router.push({ name: 'map', params: { type: 'hospital', pid: id } })
    },
    selectProvider(id) {
      this.$router.push({ name: 'map', params: { type: 'provider', pid: id } })
    },
    statuses(things) {
      if (things) {
        const statusSet = new Set()
        Object.values(things).forEach((t) => {
          if (t.Status) {
            let status = t.Status
            if (t.Status === 'Not started' && t['Priority Target']) {
              status = `${status} (${t['Priority Target']})`
            }
            statusSet.add(status)
          }
        })
        const output = {}
        statusSet.forEach((s) => {
          output[s] = true
        })
        return output
      }
      return {}
    },
    changeHospitalFilter(status, checked) {
      this.$set(this.hospitalFilters, status, checked)
    },
    changeProviderFilter(status, checked) {
      this.$set(this.providerFilters, status, checked)
    }
  },
  created() {
    if (this.google) {
      this.load()
    }
  }
}
</script>

<style lang="scss" scoped>
.locations {
  display: flex;
  width: 100vw;

  $sidebar-width: 400px;
  .map {
    width: calc(100vw - #{$sidebar-width});
    height: 100vh;
  }
  .sidebar {
    background: #fff;
    position: relative;
    width: $sidebar-width;
    padding: 15px 25px;
    border-left: 1px solid #777;

    .selection {
      font-size: 1.25rem;
      ul {
        margin: 5px;
        margin-bottom: 30px;
        list-style: none;
        padding-inline-start: 0;
        li {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
        }
      }
      div.circle {
        display: inline-block;
        height: 13px;
        width: 13px;
        border-radius: 13px;
        background: #f00;
        border: 1px solid #888;
      }
      .circle, svg {
        margin: 0 5px;
      }
    }

    .current-place {
      position: relative;
      padding-top: 10px;

      .place-info {
        margin-top: 40px;
      }

      .close, {
        position: absolute;
        top: 2px;
        right: 15px;
        font-size: 35px;
        a {
          text-decoration: none;
          color: #000;
        }
        &:hover {
          cursor: pointer;
        }
      }
      h2, h3, h4 {
        margin: 0px;
      }
    }

    h2, h3, h4 {
      margin: 15px;
    }
  }
}
</style>
