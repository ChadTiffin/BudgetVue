<template>
<div>
	<section>
		<div class="filtering" v-if="!isOffline">

			<div class="btn-group" data-toggle="buttons" style="display: inline-block;">
				<label class="btn btn-info" :class="{active: activeFilterButton == currentYear-1}" v-on:click="filterYear(currentYear-1)">
					<input type="radio" autocomplete="off">
					{{ currentYear-1 }}
				</label>
				<label class="btn btn-info" :class="{active: activeFilterButton == currentYear}" v-on:click="filterYear(currentYear)">
					<input type="radio" autocomplete="off">
					{{ currentYear }}
				</label>

				<label v-for="(month, index) in months" class="btn btn-warning" :class="{active : index == activeFilterButton}" v-on:click="filterMonth(index+1)">
					<input type="radio" autocomplete="off">
					{{ month.substring(0,3).toUpperCase() }}
				</label>
			</div>

			<button 
				v-on:click="showAdvancedFiltering ? showAdvancedFiltering = false : showAdvancedFiltering = true " 
				class="btn btn-default toggle-advanced-filtering">
				<i class="fa fa-search"></i> Toggle Advanced Filtering</a>
			</button>

			<div class="panel panel-default" v-if="showAdvancedFiltering" style="margin-top: 10px;">
				<div class="panel-body">

					<form class="form-horizontal">
						<div class="col-md-6">
							<div class="form-group">
								<label class="control-label col-md-3">Bank Account</label>
								<div class="input-group col-md-9">
									<label class="input-group-addon">
										<input type="checkbox" v-model="includeBankAccountFilter" v-on:change="filterTransactions">
									</label>
									<select class="form-control" v-model="bankAccountFilterId" v-on:change="filterTransactions">
										<option>Select a Bank Account...</option>
										<option
											v-for="(account, index) in bankAccounts" 
											v-if="account.off_budget == 0" 
											:value="account.id">
											{{ account.description }}
										</option>
										<option value="0">(No Account)</option>
									</select>
								</div>
							</div>

							<div class="form-group">
								<label class="control-label col-md-3">Group</label>
								<div class="input-group col-md-9">
									<label class="input-group-addon">
										<input type="checkbox" v-model="includeGroupFilter" v-on:change="filterTransactions">
									</label>
									<GroupsSelect v-model="groupFilterId" :groups="groups" v-on:change="filterTransactions" v-on:click="filterTransactions">
										<option>Select a Group...</option>
									</GroupsSelect>
								</div>
							</div>

							<div class="form-group" v-if="includeGroupFilter">
								<label class="control-label col-md-3">Category</label>
								<div class="input-group col-md-9">
									<label class="input-group-addon">
										<input type="checkbox" v-model="includeCategoryFilter" v-on:change="filterTransactions">
									</label>
									<select 
										class="form-control" 
										v-model="categoryFilterId" 
										v-on:change="filterTransactions"
										v-on:click="filterTransactions">
										<option>Select a Category...</option>
										<option v-for="cat in filterGroupCategories" :value="cat.id">{{ cat.description }}</option>
									</select>
								</div>
							</div>

						</div>

						<div class="col-md-6">

							<div class="form-group">
								<label class="control-label col-md-3">Date Range</label>
								<div class="col-md-9">
									<!--<input type="date" class="form-control col2-control" name="date_from" v-on:change="filterTransactions" v-model="filtering.date_from">
									<input type="date" class="form-control col2-control"  name="date_to" v-on:change="filterTransactions" v-model="filtering.date_to">-->
									<DateField 
										v-model="filtering.date_from[1]"
										v-on:change="filterTransactions"
										name="date_from"
										extra-classes="form-control"
										class="col2-control">
									</DateField>
									<DateField 
										v-model="filtering.date_to[1]"
										v-on:change="filterTransactions"
										name="date_to"
										extra-classes="form-control"
										class="col2-control">
									</DateField>
								</div>
							</div>

							<div class="form-group">
								<label class="control-label col-md-3">Amounts</label>
								<div class="col-md-9">
									<input type="number" step="0.01" 
									class="form-control  col2-control" name="amount_low" placeholder="Min $" v-on:change="filterTransactions" v-model="filtering.amount_low[1]">
									<input type="number" step="0.01" class="form-control  col2-control"  name="amount_high" placeholder="Max $"  v-on:change="filterTransactions" v-model="filtering.amount_high[1]">
								</div>
							</div>
							
							<div class="form-group">
								<label class="control-label col-md-3">Keyword</label>
								<div class="col-md-9">
									<input type="text" class="form-control" name="keyword" placeholder="Keyword..." v-on:change="filterTransactions" v-model="filtering.keyword[1]">
								</div>
							</div>

						</div>
					</form>
				</div>
			</div>
		</div>

		<!--<p>{{ filterMessage }}</p>-->

		<p>{{ transactions.length }} transactions listed.</p>
		<div style="overflow-x: auto;">
			<table class="table table-striped table-condensed">
				<thead>
					<tr>
						<th style="width: 100px">Date</th>
						<th>Account</th>
						<th>Group: Category</th>
						<th>Description</th>
						<th style="width: 90px!important">Debit</th>
						<th style="width: 90px!important">Credit</th>
						<th>User</th>
						<th style="width: 60px;"></th>
					</tr>
					<tr>
						<td colspan="3"></td>
						<th>Totals</th>
						<th class="number">{{ totalsDisplayed.debit }}</th>
						<th class="number">{{ totalsDisplayed.credit }}</th>
						<td colspan="2"></td>
					</tr>
				</thead>
				<tbody>
					<tr v-for="tran in transactions">
						<td>{{ tran.tran_date }}</td>
						<td>{{ tran.bank_accounts != null ? tran.bank_accounts.description : 'N/A'}}</td>
						<td>
							<strong>
								{{ tran.categories.name }}{{ tran.categories.name ? ':' : '' }}
							</strong>
							{{ tran.categories.description }}
						</td>
						<td>{{ tran.description }}</td>
						<td class="bg-outflows number">{{ parseInt(tran.in_out) ? tran.amount : '' }}</td>
						<td class="bg-success number" >{{ parseInt(tran.in_out) ? '' : tran.amount }}</td>
						<td>{{ tran.first_name }}</td>
						<td class="btn-col">
							<div v-if="!isOffline">
								<i class="fa fa-fw icon-button fa-pencil" v-on:click="showTransactionModal(tran)"></i>
								<i class="fa fa-fx fa-remove icon-button" v-on:click="deleteItem('transaction',tran.id, 'executeDeleteTransaction')"></i>
							</div>
						</td>
					</tr>
				</tbody>
				<tfoot>
					<tr>
						<td colspan="3"></td>
						<th>Totals</th>
						<th class="number">{{ totalsDisplayed.debit }}</th>
						<th class="number">{{ totalsDisplayed.credit }}</th>
						<td colspan="3"></td>
					</tr>
				</tfoot>
			</table>
		</div>
	</section>

	<spinner :spinner-visible="spinnerVisible"></spinner>

	<ModalDialog
		v-if="confirmDialog.visible" 
		:title="confirmDialog.title" 
		:modal-visible="confirmDialog.visible" 
		:confirm-button-text="confirmDialog.buttonText"
		v-on:confirm="confirmationDialogResponse(true)"
		v-on:closeModal="confirmationDialogResponse(false)"
		>{{confirmDialog.message}}
	</ModalDialog>
</div>
</template>

<script type="text/javascript">
	import Spinner from '../components/Spinner'
	import GroupsSelect from '../components/GroupsSelect'
	import CategoriesSelect from '../components/CategoriesSelect'
	import DateField from '../components/DateField'
	import ModalDialog from '../components/ModalDialog'
	import bus from '../bus.js'

	export default {
		name: "TransactionLog",
		components: {
			Spinner,
			GroupsSelect,
			CategoriesSelect,
			DateField,
			ModalDialog
		},
		props: ["groups",'categories','bankAccounts','isOffline'],
		data () {
			return {
				transactions : [],
				spinnerVisible : false,
				filtering : {},
				includeGroupFilter: false,
				groupFilterId: 0,
				includeCategoryFilter: false,
				categoryFilterId: 0,
				includeBankAccountFilter: false,
				bankAccountFilterId: 0,
				months: [ "January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December" ],
				activeFilterButton: -1,
				showAdvancedFiltering: false,
				filterGroupCategories: [],
				confirmDialog : {
					visible: false,
					title: "",
					message: "",
					successFunction : "",
					parameters: ""
				}
			}
		},
		methods: {
			resetFiltering() {
				this.filtering = {
					date_from : ["tran_date >=",this.currentMonthFirstDay],
					date_to: ["tran_date <=",this.currentMonthLastDay],
					account_id: ["account_id",null],
					group_id : ["group_id",null],
					cat_id : ["cat_id",null],
					amount_low : ["amount >=",null],
					amount_high: ["amount <=",null],
					keyword : ["transactions.description",null,"like"],
					user_id : ["user_id",null] 
				}
			},
			toggleGroupfilter() {

			},
			toggleCategoryFilter () {
			
			},
			filterMonth(mon) {
				this.resetFiltering()

				this.activeFilterButton = mon-1

				if (mon < 10)
					mon = "0"+mon

				let d = new Date()
				let last_day_of_month = new Date(this.currentYear, d.getMonth() + 1, 0)
				last_day_of_month = last_day_of_month.getDate()

				this.filtering.date_from = [
					"tran_date >=", this.currentYear + "-" + mon + "-01"
				]

				this.filtering.date_to = [
					"tran_date <=", this.currentYear + "-" + mon + "-" + last_day_of_month
				]

				this.fetchTransactions(this.filtering)
			},
			filterYear(year) {
				this.resetFiltering()

				this.filtering.date_from = [
					"tran_date >=", year + "-01-01"
				]
				this.filtering.date_to = [
					"tran_date <=", year + "-12-31"
				]

				this.activeFilterButton = year

				this.fetchTransactions(this.filtering)
			},
			updateCategoryList() {
				
				let vm = this
				let categories = []

				this.groups.forEach(function(group, index) {
					//console.log(group.id)
					if (vm.filtering.group_id[1] == group.id) {
						categories = group.categories
					}
				})

				this.filterGroupCategories = categories
			},
			filterTransactions() {

				if (this.includeGroupFilter) 
					this.filtering.group_id[1] = this.groupFilterId
					
				else
					this.filtering["group_id"][1] = null

				if (this.includeCategoryFilter)
					this.filtering.cat_id[1] = this.categoryFilterId
					
				else
					this.filtering["cat_id"][1] = null

				if (this.includeBankAccountFilter)
					this.filtering.account_id = [
						'account_id', this.bankAccountFilterId
					]
				else
					this.filtering["account_id"][1] = null

				this.updateCategoryList()

				this.fetchTransactions(this.filtering)

			},
			deleteItem(resource, id, executeFunction) {
				
				this.confirmDialog.title = "Delete"
				this.confirmDialog.message = "Are you sure you want to delete this?"
				this.confirmDialog.successFunction = "executeDelete"
				this.confirmDialog.buttonText = "Delete"
				this.confirmDialog.parameters = {
					resource: resource,
					id: id
				}

				this.confirmDialog.visible = true

			},
			confirmationDialogResponse(response) {
				if (response) {
					this[this.confirmDialog.successFunction](this.confirmDialog.parameters)
				}
				this.confirmDialog.visible = false
			},
			executeDelete(parameters) {
				let payload = {
					id : parameters.id
				}

				let vm = this

				this.postData(window.apiBase + parameters.resource + "/delete",payload).then(function(response) {

					let alert_msg = "Item deleted"
					if (response.status == 'success') {
						vm.fetchTransactions(vm.filtering)
					}
					else {
						vm.alert.msg = response.msg
					}

					vm.$emit("alertUpdate",{
						class: "alert-danger",
						msg: alert_msg,
						visible: true
					})
					
				})
			},
			fetchTransactions (filtering) {
				let vm = this

				this.spinnerVisible = true

				let filters = []
				for (var key in filtering) {
					if (filtering[key][1] != null) {
						filters.push([
							filtering[key][0],filtering[key][1],
						])
					}
				}
				let query = "?filters="+JSON.stringify(filters)

				this.getJSON(window.apiBase + "transaction/get"+query).then(function(response){

					vm.spinnerVisible = false

					if (response.status == 'offline') {
						vm.transactions = JSON.parse(localStorage.transactionLog)
					}
					else {
						vm.transactions = response
						localStorage.transactionLog = JSON.stringify(response)
					}
				})

				/*
				this.getJSON(window.apiBase + "transaction/filter/"+filtering.date_from+"/"+filtering.date_to+"/"+filtering.group_id+"/"+filtering.cat_id+"/"+filtering.amount_low+"/"+filtering.amount_high+"/"+filtering.keyword+"/"+filtering.user_id).then(function(response){

					vm.spinnerVisible = false

					if (response.status == 'offline') {
						vm.transactions = JSON.parse(localStorage.transactionLog)
					}
					else if (response.status == 'success') {
						vm.transactions = response.transactions
						localStorage.transactionLog = JSON.stringify(response.transactions)
					}
				})*/

			},
			showTransactionModal(tran) {
				this.$emit("showTransactionModal",tran)
			}
		},
		computed: {
			totalsDisplayed () {
				let total_debit = 0
				let total_credit = 0

				this.transactions.forEach(function(tran, index) {
					if (parseInt(tran.in_out) === 0) {
						total_credit += parseFloat(tran.amount)
					}
					else
						total_debit += parseFloat(tran.amount)

				});

				return {
					debit : total_debit.toFixed(2),
					credit : total_credit.toFixed(2)
				}
			},
			currentMonthFirstDay () {
				let d = new Date()
				let current_month = d.getMonth() + 1

				if (current_month < 10)
					current_month = "0"+current_month
				
				return this.currentYear+"-"+current_month+"-01"
			},
			currentMonthLastDay () {
				let d = new Date()
				let last_day_of_month = new Date(this.currentYear, d.getMonth() + 1, 0)
				last_day_of_month = last_day_of_month.getDate()

				return this.currentYear + "-" + this.currentMonth + "-" + last_day_of_month
			},
			currentYear() {
				let d = new Date()

				return d.getFullYear()
			},
			currentMonth() {
				let d = new Date()

				let current_month = d.getMonth() +1
				if (current_month < 10)
					current_month = "0"+current_month

				return current_month
			},
			/*filterMessage() {
				let message = "Filtering ";

				if (this.filtering.group_id[1] != null)
					message += " by group and"

				if (this.filtering.cat_id[1] != null)
					message += " by category and"
				
				if (this.filtering.date_from != null)
					message += " from " + this.filtering.date_from + " to"
				else
					message += " before"

				if (this.filtering.date_to != null)
					message += " " + this.filtering.date_to
				else
					message += " onwards"

				if (this.filtering.amount_low != null)
					message += " amounts between " + parseFloat(this.filtering.amount_low).tofixed(2) + " and"

				if (this.filtering.amount_high != null)
					message += " " + parseFloat(this.filtering.amount_high).toFixed(2)
				else if (this.filtering.amount_low != null)
					message += " above"

				if (this.filtering.keyword != null && this.filtering.keyword != '')
					message += " with description containing '" + this.filtering.keyword + "'"

				return message
			}*/
		},
		created () {
			let vm = this

			this.resetFiltering()

			this.filtering.date_from = ['tran_date >=',this.currentMonthFirstDay]
			this.filtering.date_to = ['tran_date <=',this.currentMonthLastDay]

			//asign filtering url vars to filtering params
			for (var key in this.$route.query) {

				if (this.$route.query[key][1] == 'undefined')
					this.filtering[key][1] = null
				else
					this.filtering[key][1] = this.$route.query[key]
			}

			this.fetchTransactions(this.filtering)

			bus.$on("transactionSubmitted", function(){
				vm.fetchTransactions(vm.filtering)
			})
		}
	}
</script>

<style type="text/css" scoped>
	.filtering {
		margin-bottom: 10px;
	}

	.field-divider {
		margin-bottom: 10px;
	}

	.filtering .input-group {
		padding-left: 15px;
		padding-right: 15px;
	}

	@media (max-width: 815px) {
		.filtering .btn-group label.btn {
			width: 14.27%;
			text-align: center;
		}

		.toggle-advanced-filtering {
			display: block;
			width: 100%;
			margin-top: 10px;

		}
	}

	@media (max-width: 500px) {
		.filtering .panel-body {
			padding: 0;
			padding-top: 10px;
		}
	}

	@media (max-width: 400px) {
		.filtering .btn-group label.btn:nth-child(1),
		.filtering .btn-group label.btn:nth-child(2) {
			display: none;

		}

		.filtering .btn-group label.btn {
			width: 16.667%;
			margin: 0;
			border-radius: 0!important;
		}

	}
</style>

