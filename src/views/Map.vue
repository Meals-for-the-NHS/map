<template lang="html">
<div class="locations">
  <place-map ref="map" :loaded="loaded" :currentPlace="currentPlace"
       :hospitals="filteredHospitals" :providers="filteredProviders"
       @load="load" @hospitalClick="selectHospital" @providerClick="selectProvider">
  </place-map>
  <div class="sidebar">
    <div v-if="!hospitals && !providers">
      <p>Loading...</p>
    </div>
    <div v-else class="selection">
      <h2>Hospitals</h2>
      <ul>
        <li v-for="filter in hospitalFilterList" :key="`hs-${filter}`">
          <input type="checkbox" :checked="hospitalFilters[filter]"
                 @change="changeHospitalFilter(filter, $event.target.checked)">
          <svg width="20px" height="20px">
            <g transform="scale(3) translate(3, 3) ">
              <path :d="$refs.map.hospitalIcon.path" :fill="$refs.map.colours[filter]"/>
            </g>
          </svg>
          {{ filter }}
        </li>
      </ul>
      <h2>Providers</h2>
      <ul>
        <li v-for="filter in providerFilterList" :key="`pr-${filter}`">
          <input type="checkbox" :checked="providerFilters[filter]"
                 @change="changeProviderFilter(filter, $event.target.checked)">
         <div class="circle" :style="{ background: $refs.map.colours[filter]}"></div>
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
        <h4>{{ currentPlace['Local Authority'] }}</h4>
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
    <div v-else class="search">
      <input type="text" v-model="searchTerm" placeholder="Find a place"/>
      <div class="search-results">
        <ul>
          <li v-for="place in filteredList" :key="`f-${place.id}`">
            <router-link :to="{ name: 'map', params: {
                              type: place.type,
                              pid: place.id,
                              moveMap: true } }">
              {{ place.name }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Map from '@/components/Map.vue'

export default {
  components: {
    'place-map': Map
  },
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
      providerTableKeys: [
        'Status', 'Location', 'Restaurant City', 'Meal number', 'Contact owner'
      ],
      hospitalPath: 'M-3,-3 -1,-3 -1,-1 1,-1 1,-3 3,-3 3,3 1,3 1,1 -1,1 -1,3 -3,3Z',
      hospitalFilters: {},
      providerFilters: {},
      // this is so gross, but Maia wants this order and it's arbitrary
      hospitalFilterList: [
        'Receiving', 'Waiting for first order', 'Contacted',
        'Priority to respond to', 'Priority for outreach', 'Waitlist for response',
        'Not started'
      ],
      providerFilterList: [
        'Delivering', 'Onboarded', 'Not started'
      ],
      searchTerm: ''
    }
  },
  watch: {
    pid() {
      if (this.moveMap) {
        this.$refs.map.panTo(this.currentPlace.coordinates)
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
    },
    allPlaces() {
      const output = Object.entries(this.hospitals).map(([id, h]) => ({
        id,
        type: 'hospital',
        name: h['Hospital Name']
      }))
      return output.concat(Object.entries(this.providers).map(([id, p]) => ({
        id,
        type: 'provider',
        name: p['Restaurant Name']
      })))
    },
    filteredList() {
      if (this.searchTerm.length >= 3) {
        const re = new RegExp(this.searchTerm, 'i')
        return this.allPlaces.filter(p => p.name && p.name.match(re))
      }
      return []
    }
  },
  methods: {
    ...mapActions(['load']),
    selectHospital(id) {
      console.log(id)
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
            statusSet.add(t.Status)
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
    // if (this.google) {
    //   this.load()
    // }
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
        //border: 1px solid #fff;
      }
      .circle, svg {
        margin: 0 5px;
      }
    }

    .search-results {
      ul {
        list-style: none;
        margin: 5px;
        padding-inline-start: 0;
        li {
          margin-bottom: 8px;
          a {
            text-decoration: none;
            font-weight: bold;
            color: #111;
          }
        }
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
