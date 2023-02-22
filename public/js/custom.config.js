/*===========================================
            Access Token
=============================================*/
    
axios.defaults.baseURL = '/api/';

if(localStorage.getItem("access_token")){
    axios.defaults.headers.common['token'] = localStorage.getItem("access_token");

    // Add a response interceptor
    axios.interceptors.response.use(function (response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        return response;
    }, function (error) {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        if(error.response.status==401){
            localStorage.removeItem("access_token");
            window.location.href = "logout.php";
        }
        return Promise.reject(error);
    });
}

/*===========================================
            Access Token
=============================================*/


/*===========================================
                JS CONFIG
=============================================*/

Array.prototype.contains = function(v) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] === v) return true;
    }
    return false;
};
/*=================== => ==================*/
Array.prototype.unique = function() {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
      if (!arr.contains(this[i])) {
        arr.push(this[i]);
      }
    }
    return arr;
}

Array.prototype.unique_array = function(key='id') {
  var arr = [];
  return Object.values(this).filter((v, i)=>{
    if(!arr.contains(v[key])){
      arr.push(v[key]);
      return true;
    }else{
      return false;
    }
  })
}

Array.prototype.insert = function ( index, ...items ) {
  this.splice( index, 0, ...items );
};

String.prototype.capitalize = function () {
  return Object.values(this.toLowerCase()).join('')
  .split(' ')
  .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
  .join(' ');
};

String.prototype.name_arr = function () {
  var nickname_regex = /\((.*?)\)/;
  let nickname = nickname_regex.exec(this);
  nickname = nickname ? nickname[1] : "";
  let name_without_nickname = this.replace(nickname_regex, '');
  let name_split = name_without_nickname.trim().split(" ");
  let last_name = name_split[name_split.length-1];
  name_split.splice(-1,1);
  let first_name = name_split.join(" ");

  return { first_name: first_name, last_name: last_name, nickname: nickname};
};


/*===========================================
                JS CONFIG
=============================================*/