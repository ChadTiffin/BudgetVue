<template>

	<section>

		<div class="alert pull-right" :class="alert.class" v-if="alert.visible">{{ alert.msg }}</div>

		<div style="clear: both;"></div>

		<form v-on:submit.prevent="submitImports">

			<label class="control-label">Account to Import To</label>
			<select class="form-control" v-model="account_id" required style="display: inline-block;width: 200px">
				<option
					v-for="(account, index) in bankAccounts" 
					v-if="account.off_budget == 0" 
					:value="account.id">
					{{ account.description }}
				</option>
			</select>

			<div style="overflow-x: auto">
				<table class="table table-striped">
					<thead>
						<tr>
							<th>Transaction Date</th>
							<th>Statement Description</th>
							<th>Amount</th>
							<th>
								<label>
									<input type="checkbox" v-model="selectAllToggle">
									Import
								</label>
							</th>
							<th style="width: 410px;">Importing Details</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="tran in localTransactions">
							<td>{{ tran.tran_date }}</td>
							<td>{{ tran.memo }}</td>
							<td class="number">{{ tran.amount }}</td>
							<td class="has-control">
								<label>
									<input type="checkbox" v-model="tran.no_match">
									Import
								</label>
							</td>
							<td class="has-control">
								<div class="form-inline" v-if="tran.no_match">
									<GroupsCategoriesSelect
										style="width:170px;" 
										v-model="tran.cat_id" 
										:groups="groups"
										include-off-budget="true"
										include-income="true">
									</GroupsCategoriesSelect>
									<button type="button" title="Copy memo over" class="btn btn-default" v-on:click="copyMemoToDescription(tran)"><i class="fa fa-copy"></i></button>
									<input type="text" placeholder="Description" v-model="tran.description" class="form-control" style="width: 170px;">
									
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<button class="btn btn-danger" type="button" v-on:click="purgeImports" style="margin-top: 10px;"><i class="fa fa-remove"></i> Purge Pending Imports</button>
			
			<div class="pull-right">
				<button class="btn btn-primary" type="submit" style="margin-top: 10px;"><i class="fa fa-check"></i> Submit</button>
			</div>
			<div style="clear: both;"></div>

		</form>

		<spinner :spinner-visible="spinnerVisible"></spinner>

	</section>

</template>

<script type="text/javascript">
	import GroupsCategoriesSelect from "../components/GroupsCategoriesSelect"
	import Spinner from '../components/Spinner'

	export default {
		name: "TransactionClearing",
		components: {
			GroupsCategoriesSelect,
			Spinner
		},
		props: ["groups","bankAccounts"],
		data () {
			return {
				transactions: [],
				account_id : 0,
				alert : {
					visible: false,
					msg: "",
					class: ""
				},
				spinnerVisible: false,
				selectAllToggle: false
			}
		},
		watch: {
			selectAllToggle() {
				let vm = this;

				this.transactions.forEach(function(tran, index){
					tran['no_match'] = vm.selectAllToggle
				})
			}
		},
		methods: {
			copyMemoToDescription(tran) {
				tran.description = tran.memo
			},
			submitImports(){

				let vm = this

				let payload = {
					transactions: this.payloadTransactions,
					account_id: this.account_id
				}

				this.postData(window.apiBase+"import/merge",payload).then(function(response){
					vm.fetchPendingTransactions()
				})
			},
			purgeImports() {
				let vm = this

				this.postData(window.apiBase + "/import/purge",{purge: true}).then(function(response){
					vm.fetchPendingTransactions()
				})
			},
			fetchPendingTransactions() {
				let vm = this

				this.spinnerVisible =true

				this.getJSON(window.apiBase + "import/get").then(function(response) {
					vm.transactions = response
					vm.spinnerVisible = false
				})
			}
		},
		computed: {
			localTransactions() {
				let vm = this
				let localTransactions = this.transactions
				localTransactions.forEach(function(tran, index){
					
					vm.$set(tran,"cat_id",0)
					vm.$set(tran,"description","")

				})

				return localTransactions
			},
			payloadTransactions() {
				let transactions = []
				let vm = this

				this.localTransactions.forEach(function(tran, index){

					let in_out = 1
					let amount = tran.amount
					if (tran.amount < 0) {
						//set as a credit (inflow)
						in_out = 0
						amount = Math.abs(amount)
					}

					if (tran.no_match) {

						transactions.push({
							id: tran.id,
							tran_date: tran.tran_date,
							description: tran.description,
							cat_id: tran.cat_id,
							amount: amount,
							in_out: in_out
						})
					}
				})

				return transactions
			}
		},
		created() {
			this.fetchPendingTransactions()
		}
	}
</script>

<style type="text/css" scoped>


	@media (max-width: 500px) {

	}
</style>

