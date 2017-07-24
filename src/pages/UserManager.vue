<template>

	<section>

		<div class="alert pull-right" :class="alert.class" v-if="alert.visible">{{ alert.msg }}</div>

		<p><button class="btn btn-success" v-on:click="newUser"><i class="fa fa-plus"></i> New User</button></p>

		<div style="clear: both;"></div>

		<table class="table table-striped table-condensed">
			<thead>
				<tr>
					<th>First Name</th>
					<th>Last Name</th>
					<th>Username</th>
					<th>Email</th>
					<th>Permissions</th>
					<th>Last Login</th>
					<th>API Key</th>
					<th class="btn-col"></th>
				</tr>	
			</thead>
			<tbody>
				<tr v-for="user in users">
					<td>{{ user.first_name }}</td>
					<td>{{ user.last_name }}</td>
					<td>{{ user.username }}</td>
					<td>{{ user.email }}</td>
					<td>{{ user.user_level }}</td>
					<td>{{ user.last_login }}</td>
					<td>{{ user.api_key }}</td>
					<td>
						<i class="fa fa-fw fa-pencil icon-button" v-on:click="editUser(user)"></i>
						<i class="fa fa-fw fa-remove icon-button"></i>
					</td>
				</tr>
			</tbody>
		</table>

		<ModalDialog
			v-if="userDialog.visible" 
			title="Edit User" 
			:modal-visible="userDialog.visible" 
			confirm-button-text="Save"
			v-on:closeModal="userDialog.visible = false">
			
			<FormGroup label="First Name" col-class="col-md-3">
				<input type="text" v-model='userDialog.fields.first_name' class="form-control">
			</FormGroup>

			<FormGroup label="Last Name" col-class="col-md-3">
				<input type="text" v-model='userDialog.fields.last_name' class="form-control">
			</FormGroup>

			<FormGroup label="Email" col-class="col-md-3">
				<input type="text" v-model='userDialog.fields.email' class="form-control">
			</FormGroup>

			<FormGroup label="Permission" col-class="col-md-3">
				<select class="form-control" v-model="userDialog.fields.user_level">
					<option>Admin</option>
					<option>User</option>
				</select>
			</FormGroup>



			<FormGroup label="API Key" col-class="col-md-3">
				<p class="form-control-static">{{ userDialog.fields.api_key }}</p>
			</FormGroup>
		</ModalDialog>

		<ModalDialog
			v-if="confirmDialog.visible" 
			:title="confirmDialog.title" 
			:modal-visible="confirmDialog.visible" 
			:confirm-button-text="confirmDialog.buttonText"
			v-on:confirm="confirmationDialogResponse(true)"
			v-on:closeModal="confirmationDialogResponse(false)">
			{{ confirmDialog.message }}
		</ModalDialog>

		<spinner :spinner-visible="spinnerVisible"></spinner>
	</section>

</template>

<script type="text/javascript">
	import Spinner from '../components/Spinner'
	import ModalDialog from '../components/ModalDialog'
	import FormGroup from '../components/FormGroup'

	export default {
		name: "AccountManager",
		props: ["bankAccounts"],
		components: {
			Spinner,
			ModalDialog,
			FormGroup
		},
		data () {
			return {
				alert : {
					visible: false,
					msg: "",
					class: ""
				},
				confirmDialog : {
					visible: false,
					title: "",
					message: "",
					successFunction : "",
					parameters: ""
				},
				userDialog : {
					visible: false,
					fields: {}
				},
				spinnerVisible : false,
				users: []
			}
		},
		methods: {
			newUser() {

			},
			editUser(user) {
				this.userDialog.visible = true

				this.userDialog.fields = user
			},
			fetchUsers() {
				let vm = this

				this.getJSON(window.apiBase + "user/get").then(function(response) {
					vm.users = response
				})
			}
		},
		created() {
			this.fetchUsers()
		}
	}
</script>

<style type="text/css" scoped>


	@media (max-width: 500px) {

	}
</style>

