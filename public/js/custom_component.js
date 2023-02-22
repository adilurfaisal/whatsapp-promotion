(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('vue')) :
    typeof define === 'function' && define.amd ? define(['vue'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.CustomComponent = factory(global.Vue));
  }(this, (function (vue) { 'use strict';

    const app = vue.createApp();

    var CAudio = vue.defineComponent({
        name: 'custom-audio',
        props: {
            url: String
        },

        emits: [ 
            'play'
        ],

        setup (props, { slots, emit }) {

        const rootRef = vue.ref(null);

        const { proxy } = vue.getCurrentInstance();
        Object.assign(proxy, { play: Play });

        const url = vue.computed(() =>
            `${ props.url ? props.url : 'none' }`
        );

        function onloadeddata (e) {
            console.log(rootRef.value, 'onloadeddata');
            return;
        }

        function Play () {
            console.log('Play', rootRef.value);
            return;
        }

        function onstorage (e) {
            console.log(e.target, 'onstorage');
            return;
        }

        function OnPlay (e) {
            console.log(rootRef.value, 'OnPlay');
            emit('play', e);
            return;
        }
    
        const onEvents = vue.computed(() => {
            return {
                onplay: OnPlay,
                onloadeddata,
                onstorage
            }
        });

        return () => 
            vue.h('audio', {
                ref: rootRef,
                src: url.value,
                controls: true,
                preload: true,
                autoplay: true,
                ...onEvents.value
            }, slots)

        }
    });

    var CustomComponent = {
        components:{
            //CAudio
        }
    }

    CustomComponent.install = function (Vue, options) {
        Object.values(CustomComponent.components).forEach((item, key)=>{
            //Vue.component(item.name, item)   
        })
    }

    return CustomComponent;
  })));