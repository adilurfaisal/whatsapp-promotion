<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col-12">
        <q-form @submit="onSubmit" class="q-gutter-md q-mb-md">

          <q-input
            dense
            filled
            v-model="contactForm.search"
            label="Search Keyword"
            lazy-rules
            :readonly="contacttblSync"
          ></q-input>

          <div>
            <q-btn
              dense
              class="q-px-md"
              name="start"
              v-if="contacttblSync == false"
              label="Start"
              type="submit"
              color="primary"
            ></q-btn>
            <q-btn
              dense
              class="q-px-md"
              name="stop"
              v-else
              label="Stop"
              type="submit"
              color="red"
            ></q-btn>
          </div>
        </q-form>

        <q-table
          :loading="contacttblSync"
          style="max-height: calc(100vh - 250px)"
          class="my-sticky-header-table"
          :rows="contacttblData"
          :columns="contacttblcolumns"
          row-key="title"
          :rows-per-page-options="[0]"
        >
        </q-table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-sticky-header-table thead tr th {
  background-color: white;
}
</style>

<script>
module.exports = {
  data() {
    return {
      leftDrawerOpen: false,
      contactForm: {
        search: "",
      },
      contacttblSync: false,
      contacttblData: [],
      contacttblcolumns: [
        {
          name: "title",
          label: "Title",
          field: "title",
          align: "left",
          sortable: true,
        },
        {
          name: "phone",
          label: "Phone",
          field: "phone",
          align: "center",
          sortable: true,
        },
      ],
    };
  },
  mounted() {
    ipcRenderer.on("contact-sync-data-tbl", async (evt, data) => {
      this.contacttblData = [...this.contacttblData, ...data];
      this.contacttblSync = true;
    });
    ipcRenderer.on("contact-sync-done", async (evt, data) => {
      this.contacttblSync = false;
    });
  },
  methods: {
    async onSubmit(evt) {
      if (evt.submitter.getAttribute("name") == "start") {
        this.contacttblSync = true;
        const result = await ipcRenderer.invoke(
          "start-contact-sync",
          this.contactForm.search
        );
      } else if (evt.submitter.getAttribute("name") == "stop") {
        this.contacttblSync = false;
        const result = await ipcRenderer.invoke(
          "stop-contact-sync",
          this.contactForm.search
        );
      }
    },
  },
};
</script>
