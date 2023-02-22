<template>
  <div class="row justify-center">
    <div class="col-12 row justify-center">
      <h3>QR Code</h3>
    </div>
    <div class="col-12 row justify-center">
      <q-img
        ratio="1"
        :src="qrcodeUrl"
        spinner-color="white"
        style="height: 400px; max-width: 400px"
      >
        <template v-slot:error>
          <div class="absolute-full flex flex-center bg-blue-grey-3 text-white">
            QR Code Loading
          </div>
        </template>
      </q-img>
    </div>
  </div>
</template>

<script>
module.exports = {
  data() {
    return {
      qrcode: "",
      qrcodeUrl: "d",
    };
  },
  async mounted() {
    ipcRenderer.on("ready", async (evt, data) => {
      console.log(data);
    });

    ipcRenderer.on("qr-login", async (evt, data) => {
      this.qrcode = data;
      QRCode.toDataURL(this.qrcode, {}, (err, url) => {
        if (err) throw err;
        this.qrcodeUrl = url;
      });
    });

    const result = await ipcRenderer.invoke("qr-login", []);
  },
  methods: {},
};
</script>
