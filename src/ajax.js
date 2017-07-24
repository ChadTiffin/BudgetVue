export default {
	methods: {

		getJSON: function(url) {
			return new Promise(function(resolve, reject) {

				if (typeof localStorage.apiKey != 'undefined') {
					if (url.indexOf("?") >= 0)
						url += "&key="+localStorage.apiKey
					else
						url += "?key="+localStorage.apiKey
				}

				fetch(url,{
					credentials: 'include'
				})
					.then(function(response){
						return response.json();
					})
					.catch(function(e){
						console.log(e)
					})
					.then(function(j){
						if (typeof j == 'undefined') {//seem to be offline 
							let response = {
								status: "offline"
							}

							resolve(response)
						}
						else {
							if ("status" in j && j.status == "unauthorized")
								window.location = "/login"
								//console.log("redirect to login")

							else 
								resolve(j)
						}
					})
			});

		},
		postForm: function(form_id) {
			return new Promise(function (resolve, reject) {
				
				let form_el = document.getElementById(form_id)

				let url = form_el.getAttribute("action")
				let payload = new FormData(form_el)

				if (typeof localStorage.apiKey != 'undefined')
					payload.append("key",localStorage.apiKey);

				fetch(url,{
					method: "POST",
					credentials: 'include',
					body: payload
				})
				.then(function(response) {
					return response.json()
				})
				.catch(function(e){
					console.log(e)
				})
				.then(function(j) {
					if (typeof j == 'undefined') {//seem to be offline 
						let response = {
							status: "offline"
						}

						resolve(response)
					}
					else {
						if ("status" in j && j.status == "unauthorized")
							window.location = "/login"
							//console.log("redirect to login")

						else 
							resolve(j)
					}
				})

			})
		},
		postData: function(url, data) {
			return new Promise(function (resolve, reject) {

				let payload = new FormData()
				for (var key in data) {
					if (typeof data[key] == "object")
						data[key] = JSON.stringify(data[key])

					payload.append(key, data[key])
				}

				if (typeof localStorage.apiKey != 'undefined')
					payload.append("key",localStorage.apiKey);

				fetch(url, {
					method: "POST",
					credentials: 'include',
					body: payload
				})
				.then(function(response) {
					return response.json()
				})
				.catch(function(e){
					console.log(e)
				})
				.then(function(j) {
					if (typeof j == 'undefined') {//seem to be offline 
						let response = {
							status: "offline"
						}

						resolve(response)
					}
					else {
						if ("status" in j && j.status == "unauthorized")
							window.location = "/login"
							//console.log("redirect to login")

						else 
							resolve(j)
					}
				})

			})
		}
	}
}