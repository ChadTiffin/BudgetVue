<template>

	<section>

		<div class="alert pull-right" :class="alert.class" v-if="alert.visible">{{ alert.msg }}</div>

		<p><button class="btn btn-success" v-on:click="newAccount"><i class="fa fa-plus"></i> New Account</button></p>

		<div style="clear: both;"></div>

		<table class="table table-striped table-condensed">
			<thead>
				<tr>
					<th></th>
					<th>Account Description</th>
					<th>Default</th>
					<th>Tracked in Budget</th>
					<th>Balance</th>
					<th>Last Reconciled</th>
					<th>Last Reconciled Balance</th>
					<th></th>
				</tr>	
			</thead>
			<draggable
				element='tbody'
				v-model="localBankAccounts"
				v-on:update="saveOrder">

				<tr v-for="account in localBankAccounts">
					<td class="btn-col has-control">
						<i class="fa fa-fw fa-arrows icon-button sort-account"></i>
					</td>
					<td>{{ account.description }}</td>
					<td>
						<i v-if="account.priority == 0" class="fa fa-bookmark"></i>
					</td>
					<td>
						<i v-if="account.off_budget == 0" class="fa fa-check"></i>
						<i v-else class="fa fa-times"></i>
					</td>
					<td class="number">{{ account.balance }}</td>
					<td>{{ account.last_reconciled }}</td>
					<td>{{ account.last_reconciled_balance }}</td>
					<td>
						<i v-if="account.off_budget == 0" class="fa fa-fw fa-bookmark icon-button" 
						title="Make default account"
						v-on:click="makeDefault(account)"></i>
						<i class="fa fa-fw fa-placeholder icon-button"></i>
						<i class="fa fa-fw fa-pencil icon-button" v-on:click="editAccount(account)"></i>
						<i class="fa fa-fw fa-remove icon-button" v-on:click="deleteItem('bankAccount',account.id,'executeDelete')"></i>
					</td>
				</tr>
			</draggable>
		</table>

		<spinner :spinner-visible="spinnerVisible"></spinner>

		<ModalDialog
			v-if="confirmDialog.visible" 
			:title="confirmDialog.title" 
			:modal-visible="confirmDialog.visible" 
			:confirm-button-text="confirmDialog.buttonText"
			v-on:confirm="confirmationDialogResponse(true)"
			v-on:closeModal="confirmationDialogResponse(false)">
			{{ confirmDialog.message }}
		</ModalDialog>
	</section>

</template>

<script type="text/javascript">
	import Spinner from '../components/Spinner'
	import ModalDialog from '../components/ModalDialog'
	import draggable from 'vuedraggable'

	export default {
		name: "AccountManager",
		props: ["bankAccounts"],
		components: {
			Spinner,
			ModalDialog,
			draggable
		},
		data () {
			return {
				localBankAccounts: [],
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
				spinnerVisible : false,
			}
		},
		watch: {
			bankAccounts() {
				this.localBankAccounts = this.bankAccounts
			}
		},
		methods: {
			makeDefault(account) {
				let payload = {
					id: account.id
				}

				let vm = this

				this.postData(window.apiBase+"bankAccount/make-default",payload).then(function(response) {
					if (response.status == "success") {
						vm.$emit("fetchAccounts")

						vm.alert.msg = "New default account set"
						vm.alert.class = "alert-success"
						vm.alert.visible = true
					}
				});
			},
			editAccount(account) {
				this.$emit("editAccount",account)
			},
			newAccount() {
				this.$emit("editAccount")
			},
			saveOrder() {

				let list = []
				this.localBankAccounts.forEach(function(account, index) {
					list.push(account.id)
				})

				payload = {
					list: JSON.stringify(list)
				}

				this.alert.msg = "Saving..."
				this.alert.class = "alert-warning"
				this.alert.visible = true

				this.postData(window.apiBase+"bankAccount/save-order",payload).then(function(response){
					if (response.status == 'success') {
						vm.alert.class = 'alert-success'
						let d = new Date()
						vm.alert.msg = "Saved at "+d.getHours() + ":" +d.getMinutes()+ ":"+d.getSeconds()
					}
				})

			},
			deleteItem(resource, id, executeFunction) {
				
				this.confirmDialog.title = "Delete"
				this.confirmDialog.message = "Are you sure you want to delete this item?"
				this.confirmDialog.successFunction = "executeDelete"
				this.confirmDialog.buttonText = "Delete"
				this.confirmDialog.parameters = {
					resource: resource,
					id: id
				}

				this.confirmDialog.visible = true

			},
			executeDelete(parameters) {
				let payload = {
					id : parameters.id
				}

				let vm = this

				this.postData(window.apiBase + parameters.resource + "/delete",payload).then(function(response) {
					if (response.status == 'success') {

						vm.alert.msg = "Item deleted"
						vm.alert.class = "alert-danger"
						vm.alert.visible = true

						vm.$emit("fetchAccounts")
					}
					else {
						vm.alert.class = "alert-danger"
						vm.alert.visible = true
						vm.alert.msg = response.msg

					}
					
				})
			},
			confirmationDialogResponse(response) {
				if (response) {
					this[this.confirmDialog.successFunction](this.confirmDialog.parameters)
				}
				this.confirmDialog.visible = false
			},
			created () {

				this.localBankAccounts = this.bankAccounts

				let vm = this
				this.$on("saveBankAccount",function(){
					vm.alert.msg = "Bank account saved"
					vm.alert.class = "alert-success"
					vm.alert.visible = true
				})
			}
		}
	}
</script>

<style type="text/css" scoped>


	@media (max-width: 500px) {

	}
</style>

