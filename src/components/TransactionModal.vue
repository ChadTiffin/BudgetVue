<template>
	<transition
		name="modalOverlayFade"
		enter-active-class="fadeIn"
		leave-active-class="fadeOut" >

	<div class="modal is-active" v-show="modalVisible">

		<transition
			name="modalShowHide"
			enter-active-class="zoomIn"
			leave-active-class="zoomOut" >

		<div class="modal-dialog" v-show="modalVisible">
			<form class="modal-content form-horizontal" v-on:submit.prevent="submitForm">
				<div class="modal-header">
					<button type="button" class="close" v-on:click="closeModal"><span aria-hidden="true">&times;</span></button>
					<h2 class="modal-title">Log Transaction</h2>
				</div>
				<div class="modal-body">

					<div class="radio tran-type">
						<label>
							<input type="radio" name="tran_type" value="Transaction" v-model="localTranType" >
							Transaction
						</label>
						<label>
							<input type="radio" name="tran_type" value="Category Transfer" v-model="localTranType" >
							Category Transfer
						</label>
						<!--<label>
							<input type="radio" name="tran_type" value="Account Transfer" v-model="localTranType" >
							Account Transfer
						</label>-->
					</div>

					<transition 
						name="slideTransaction"
						enter-active-class="slideDown"
						leave-active-class="slideUp">
						<div v-if="localTranType == 'Transaction'">
							<FormGroup label="Date" col-class="col-md-4">
								<DateField 
									v-model="localFieldData.tran_date"
									v-on:input="updateValue"
									name="tran_date">
								</DateField>
							</FormGroup>

							<FormGroup label="Bank Account" col-class="col-md-4">
								<select class="form-control" v-model="localFieldData.account_id" required>

									<option
										v-for="(account, index) in bankAccounts" 
										v-if="account.off_budget == 0" 
										:value="account.id">
										{{ account.description }}
									</option>
									<option value="0">(No Account)</option>
								</select>
							</FormGroup>

							<FormGroup label="Category" col-class="col-md-4">
								<GroupsCategoriesSelect
									v-model="localFieldData.cat_id"
									v-on:input="updateValue"
									v-on:change="categoryChange"
									:groups = "groups"
									includeIncome="true"
									includeOffBudget="true"
									name="cat_id">
								</GroupsCategoriesSelect>
							</FormGroup>

							<FormGroup label="Description" col-class="col-md-4">
								<input type="text" v-model="localFieldData.description" name="description" class="form-control">
							</FormGroup>

							<FormGroup label="Amount" col-class="col-md-4">
								<input type="number" v-model="localFieldData.amount" step="0.01" name="amount" class="form-control">
							</FormGroup>

							<FormGroup label="" col-class="col-md-4">
								<div class="radio inflow-type">
									<label>
										<input type="radio" name="inflow_type" value="1" v-model="localFieldData.in_out" >
										Debit
									</label>
									<label>
										<input type="radio" name="inflow_type" value="0" v-model="localFieldData.in_out" >
										Credit
									</label>
								</div>
							</FormGroup>
						</div>
					</transition>
					<transition 
						name="slideTransfer"
						enter-active-class="slideDown"
						leave-active-class="slideUp">

						<div v-if="localTranType == 'Category Transfer'">
							<FormGroup label="Date" col-class="col-md-4">
								<DateField 
									v-model="transferFieldData.tran_date"
									v-on:input="updateValue"
									name="tran_date">
								</DateField>
							</FormGroup>

							<FormGroup label="Category From" col-class="col-md-4">
								<GroupsCategoriesSelect
									v-model="transferFieldData.from_id"
									v-on:input="updateValue"
									:groups = "groups"
									name="from_id">
								</GroupsCategoriesSelect>
							</FormGroup>

							<FormGroup label="Category To" col-class="col-md-4">
								<GroupsCategoriesSelect
									v-model="transferFieldData.to_id"
									v-on:input="updateValue"
									:groups = "groups"
									name="to_id">
								</GroupsCategoriesSelect>
							</FormGroup>

							<FormGroup label="Description" col-class="col-md-4">
								<input type="text" v-model="transferFieldData.description" name="description" class="form-control">
							</FormGroup>

							<FormGroup label="Amount" col-class="col-md-4">
								<input type="number" v-model="transferFieldData.amount" step="0.01" name="amount" class="form-control">
							</FormGroup>
						</div>
					</transition>

					<div class="alert" :class="alert.class" v-if="alert.visible">
						{{ alert.msg }}

						<p v-if="alert.hasErrors" v-for="error in alert.errors">
							{{error}}
						</p>
					</div>

				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-default" v-on:click="closeModal">Close</button>
					<button type="submit" class="btn btn-primary">Save</button>
				</div>
			</form>
		</div>
		</transition>
	</div>
	</transition>
</template>

<script type="text/javascript">
	import bus from '../bus.js'
	import FormGroup from "./FormGroup"
	import DateField from "./DateField"
	import GroupsCategoriesSelect from "./GroupsCategoriesSelect"

	export default {
		name: 'TransactionModal',
		props: ['modalVisible','groups','fieldData',"tranType", "bankAccounts"],
		data() {
			return {
				postUrl: window.apiBase + "transaction/save",
				localTranType: this.tranType,
				localFieldData: {},
				transferFieldData: {
					amount: null,
					from_id: null,
					to_id: null,
					tran_date: null,
					description: null
				},
				alert : {
					visible: false,
					msg: "",
					class: "",
					hasErrors: false,
					errors: []
				},
			}
		},
		components: {
			FormGroup,
			GroupsCategoriesSelect,
			DateField
		},
		watch: {
			fieldData() {
				let localFieldData = {}

				var tran_date
				if (this.fieldData.tran_date == null) {

					var today = new Date();

					var month = today.getMonth() + 1;
					var year = today.getFullYear();
					var day = today.getDate();

					if (month < 10)
						month = "0" + month;
					if (day < 10)
						day = "0" + day;

					tran_date = year + "-" + month + "-" + day;
				}
				else
					tran_date = this.fieldData.tran_date

				if (this.fieldData) {

					let account_id = 0

					if (typeof this.fieldData.account_id == 'undefined' || !this.fieldData.account_id) {

						this.bankAccounts.forEach(function(account,index){
							if (account.priority == 0)
								account_id = account.id
						})
					}
					else
						account_id = this.fieldData.account_id

					localFieldData = {
						amount: this.fieldData.amount,
						cat_id: this.fieldData.cat_id,
						account_id: account_id,
						tran_date: tran_date,
						description: this.fieldData.description,
						in_out: this.fieldData.in_out
					}
				}

				if ("id" in this.fieldData)
					localFieldData["id"] = this.fieldData.id

				this.localFieldData = localFieldData

			}
		},
		methods : {
			closeModal: function(e) {
				this.$emit("closeModal");
			},
			updateValue(value) {
				this.$emit("input",value)
			},
			categoryChange() {
				if (this.localFieldData.cat_id == 0)
					this.localFieldData.in_out = 0
				else
					this.localFieldData.in_out = 1
			},
			submitForm() {
				let vm = this

				this.alert.msg = "Saving..."
				this.alert.class = "alert-warning"
				this.alert.visible = true

				let method = "save"
				let data = this.localFieldData
				if (this.localTranType == "Category Transfer") {
					method = "transfer"
					data = this.transferFieldData
				}

				this.postData(window.apiBase+"transaction/"+method,data).then(function(response){

					if ("status" in response && response.status == "offline") {
						vm.$emit("isOffline")

						//save transaction to localStorage
						let cachedTrans = []
						if ("transactions" in localStorage)
							cachedTrans = JSON.parse(localStorage.transactions)
						else 
							cachedTrans = []
						
						cachedTrans.push(data)

						localStorage.transactions = JSON.stringify(cachedTrans)

						vm.alert.class = "alert-success"
						vm.alert.msg = "Transaction saved locally. When you get back online it will be synced with the server"
						vm.alert.hasErrors = false

					}
					else if (response.status == "success") {
						vm.alert.class = "alert-success"
						vm.alert.msg = "Transaction saved."
						vm.alert.hasErrors = false

						vm.localFieldData = {
							description: "",
							amount: ""
						}

						vm.transferFieldData = {
							from_id: null,
							to_id: null,
							amount: ""
						}

						vm.$emit("transactionSubmitted")
						vm.$emit("isOnline")
						bus.$emit("transactionSubmitted")
					}
					else {
						vm.alert.class = "alert-danger"

						if ("msg" in response)
							vm.alert.msg = response.msg

						if ("errors" in response){
							vm.alert.errors = response.errors
							vm.alert.hasErrors = true
						}

						vm.$emit("isOnline")
						
					}
				})
			}
		}
	}
</script>

<style type="text/css">
	.modal.is-active {
		background-color: rgba(10,10,10,0.8);
		display: block;
	}

	.modal-content {
		border-radius: 3px;
	}

	.radio.tran-type {
		margin-bottom: 25px;
	}

	.radio label {
		margin-right: 15px;
	}

	input[type=number] {
		text-align: right;
	}

</style>