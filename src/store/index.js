import Vue from 'vue'
import Vuex from 'vuex'
import { endPoint } from '@/util'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    hospitals: null,
    providers: null
  },
  mutations: {

  },
  actions: {
    load({ state }) {
      if (!state.hospitals && !state.restaurants) {
        fetch(endPoint('providers'))
          .then(res => res.json())
          .then((json) => {
            state.providers = {}
            json.forEach(r => {
              const { Status } = r
              if (!Status) {
                r.Status = 'None'
              }
              state.providers[r.record_id] = r
            })
          })

        fetch(endPoint('hospitals'))
          .then(res => res.json())
          .then((json) => {
            state.hospitals = {}
            json.forEach(r => {
              let { Status } = r
              if (Status) {
                if (Status === 'Not started' && r['Priority Target']) {
                  Status = `${Status} (${r['Priority Target']})`
                } else if (Status.match(/receiving/i)) {
                  Status = 'Receiving'
                }
                state.hospitals[r.record_id] = Object.assign({}, r, { Status })
              }
            })
          })
      }
    }
  },
  modules: {
  }
})
