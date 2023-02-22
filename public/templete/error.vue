<template>
    <div class="q-pa-md sub-component" sub-component>
        <div class="row justify-around">
            <div class="col-5 col-md-5 col-sm-12 q-pa-sm">
                <q-chip color="red" text-color="white" icon="close" label="Sorry, You don't have permission in this page!" ></q-chip>
            </div>
        </div>
    </div>
</template>

<script>
module.exports = {
  data() {
    return {
      q: useQuasar(),
    }
  },
  mounted() {
      
  },
  methods:{
      
  }
}
</script>
