<template>
  <div class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12">
        <q-form @submit="onSubmit" class="q-gutter-md q-mb-md">
          <q-select
            dense
            filled
            v-model="contactForm.msggroup"
            :options="msg_option"
            label="Message Group"
          ></q-select>
          <q-input
            dense
            v-if="contactForm.msggroup == 'Single'"
            filled
            v-model="contactForm.to"
            label="Number"
            lazy-rules
          ></q-input>

          <q-range
            v-if="contactForm.msggroup == 'Contact'"
            class="q-mt-xl"
            v-model="contactForm.timeOut"
            color="deep-orange"
            label-always
            markers
            marker-labels
            :min="15"
            :max="60"
            :inner-min="15"
            :inner-max="60"
            :step="5"
          >
            <template v-slot:marker-label-group="scope">
              <div
                v-for="marker in scope.markerList"
                :key="marker.index"
                :class="[
                  `text-deep-orange-${2 + Math.ceil(marker.value / 2)}`,
                  marker.classes,
                ]"
                :style="marker.style"
                @click="model = marker.value"
              >
                {{ marker.value }}
              </div>
            </template>
          </q-range>

          <q-file
            dense
            v-model="contactForm.file"
            label="Pick files"
            filled
            style="max-width: 300px"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file"></q-icon>
            </template>
          </q-file>

          <q-input
            type="textarea"
            dense
            filled
            v-model="contactForm.content"
            label="Content"
            lazy-rules
          ></q-input>

          <div>
            <q-btn
              dense
              class="q-px-md"
              name="send"
              label="Send"
              type="submit"
              color="primary"
            ></q-btn>
          </div>
        </q-form>
      </div>
      <div class="col-12">
        <q-table
          :loading="msgtblSync"
          style="max-height: calc(100vh - 350px)"
          class="my-sticky-header-table"
          :rows="msgData"
          :columns="msgColumns"
          row-key="title"
          :rows-per-page-options="[0]"
        >
        </q-table>
      </div>
    </div>
  </div>
</template>

<script>
module.exports = {
  data() {
    return {
      contactForm: {
        msggroup: "Single",
        to: "",
        file: null,
        content: "",
        timeOut: {
          min: 15,
          max: 25
        }
      },
      msg_option: ["Single", "Contact"],
      msgtblSync: false,
      msgData: [],
      msgColumns: [
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
        {
          name: "body",
          label: "Body",
          field: "body",
          align: "center",
          sortable: true,
        },
        {
          name: "status",
          label: "Status",
          field: "status",
          align: "center",
          sortable: true,
        },
      ],
    };
  },
  async mounted() {
    ipcRenderer.on("send-sync-data-tbl", async (evt, data) => {
      this.msgData = [...this.msgData, ...data];
    });
    ipcRenderer.on("send-sync-done", async (evt, data) => {
      this.msgtblSync = false;
    });
  },
  methods: {
    async getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    },
    async onSubmit(evt) {
      console.log(this.contactForm)
      let file = null;
      if (this.contactForm.file) {
        let filebase64 = await this.getBase64(this.contactForm.file);

        console.log(filebase64);
        filebase64 = filebase64.split(";base64,")[1];

        file = {
          mimetype: this.contactForm.file.type,
          data: filebase64,
          filename: this.contactForm.file.name,
          filesize: this.contactForm.file.size,
        };
      } else {
        file = null;
      }
      const result = await ipcRenderer.invoke(
        "send-msg",
        this.contactForm.msggroup,
        this.contactForm.to,
        file,
        this.contactForm.content,
        this.contactForm.timeOut.min,
        this.contactForm.timeOut.max
      );
      console.log(file, result);
      this.msgtblSync = true;
    },
  },
};
</script>
