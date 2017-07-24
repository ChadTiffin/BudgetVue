<template>
<div>
	<section>
		<div class="alert pull-right" :class="alert.class" v-if="alert.visible">{{ alert.msg }}</div>
		<div class="filtering">

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
				v-on:click="toggleAdvancedFilteringPanel" 
				class="btn btn-default">
				<i class="fa fa-search"></i> Toggle Advanced Filtering</a>
			</button>

			<div class="panel panel-default" v-if="showAdvancedFiltering" style="margin-top: 10px;">
				<div class="panel-body">

					<form class="form-horizontal">
						<div class="col-md-6">
							<div class="form-group">
								<label class="control-label col-md-3">Group</label>
								<div class="input-group col-md-9">
									<label class="input-group-addon">
										<input type="checkbox" v-model="includeGroupFilter">
									</label>
									<GroupsSelect name="group_id" :groups="groups" v-on:change="filterTransactions"></GroupsSelect>
								</div>
							</div>

							<div class="form-group">
								<label class="control-label col-md-3">Category</label>
								<div class="input-group col-md-9">
									<label class="input-group-addon">
										<input type="checkbox" v-model="includeCategoryFilter">
									</label>
									<CategoriesSelect name="cat_id" :categories="categories" v-on:change="filterTransactions"></CategoriesSelect>
								</div>
							</div>

						</div>

						<div class="col-md-6">

							<div class="form-group">
								<label class="control-label col-md-3">Date Range</label>
								<div class="col-md-9">
									<input type="date" class="form-control col2-control" name="date_from" v-on:change="filterTransactions" v-model="filtering.date_from">
									<input type="date" class="form-control col2-control"  name="date_to" v-on:change="filterTransactions" v-model="filtering.date_to">
								</div>
							</div>

							<div class="form-group">
								<label class="control-label col-md-3">Amounts</label>
								<div class="col-md-9">
									<input type="number" step="0.01" class="form-control  col2-control" name="amount_low" placeholder="Min $" v-on:change="filterTransactions" v-model="filtering.amount_low">
									<input type="number" step="0.01" class="form-control  col2-control"  name="amount_high" placeholder="Max $"  v-on:change="filterTransactions" v-model="filtering.amount_high">
								</div>
							</div>
							
							<div class="form-group">
								<label class="control-label col-md-3">Keyword</label>
								<div class="col-md-9">
									<input type="text" class="form-control" name="keyword" placeholder="Keyword..." v-on:change="filterTransactions" v-model="filtering.keyword">
								</div>
							</div>

						</div>
					</form>
				</div>
			</div>
		</div>

		<p>{{ filterMessage }}</p>

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
						<td>{{ tran.account_name != null ? tran.account_name : 'N/A'}}</td>
						<td>
							<strong>{{ tran.cat_id == 0 ? 'Income' : tran.group_name }}</strong>{{ tran.cat_id == 0 ? '' : ': '+tran.cat_description }}
						</td>
						<td>{{ tran.description }}</td>
						<td class="bg-outflows number">{{ parseInt(tran.in_out) ? tran.amount : '' }}</td>
						<td class="bg-success number" >{{ parseInt(tran.in_out) ? '' : tran.amount }}</td>
						<td>{{ tran.first_name }}</td>
						<td class="btn-col">
							<i class="fa fa-fw icon-button fa-pencil" v-on:click="showTransactionModal(tran)"></i>
							<i class="fa fa-fx fa-remove icon-button" v-on:click="deleteItem('transaction',tran.id, 'executeDeleteTransaction')"></i>
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
		props: ["groups",'categories'],
		data () {
			return {
				transactions : [],
				spinnerVisible : false,
				filtering : {},
				includeCategoryFilter: false,
				includeGroupFilter: false,
				catFilterValue: 0,
				groupFilterValue: 0,
				months: [ "January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December" ],
				activeFilterButton: -1,
				showAdvancedFiltering: false,
				confirmDialog : {
					visible: false,
					title: "",
					message: "",
					successFunction : "",
					parameters: ""
				},
				alert : {
					visible: false,
					msg: "",
					class: ""
				}
			}
		},
		methods: {
			resetFiltering() {
				this.filtering = {
					date_from : this.currentMonthFirstDay,
					date_to: this.currentMonthLastDay,
					group_id : null,
					cat_id : null,
					amount_low : null,
					amount_high: null,
					keyword : null,
					user_id : null 
				}
			},
			toggleAdvancedFilteringPanel() {
				if (this.showAdvancedFiltering) {
					this.showAdvancedFiltering = false
				}
				else
					this.showAdvancedFiltering = true
			},
			filterMonth(mon) {
				this.resetFiltering()

				this.activeFilterButton = mon-1

				if (mon < 10)
					mon = "0"+mon

				let d = new Date()
				let last_day_of_month = new Date(this.currentYear, d.getMonth() + 1, 0)
				last_day_of_month = last_day_of_month.getDate()

				this.filtering.date_from = this.currentYear + "-" + mon + "-01"
				this.filtering.date_to = this.currentYear + "-" + mon + "-" + last_day_of_month

				this.fetchTransactions(this.filtering)
			},
			filterYear(year) {
				this.resetFiltering()

				this.filtering.date_from = year + "-01-01"
				this.filtering.date_to = year + "-12-31"

				this.activeFilterButton = year

				this.fetchTransactions(this.filtering)
			},
			filterTransactions() {
				if (this.includeGroupFilter) 
					this.filtering.group_id = document.querySelectorAll('select[name=group_id]')[0].value
				else
					this.filtering.group_id = null

				if (this.includeCategoryFilter)
					this.filtering.cat_id = document.querySelectorAll('select[name=cat_id')[0].value
				else
					this.filtering.cat_id = null

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
					if (response.status == 'success') {

						vm.alert.msg = "Item deleted"
						vm.alert.class = "alert-danger"
						vm.alert.visible = true

						vm.fetchTransactions(vm.filtering)
					}
					else {
						vm.alert.class = "alert-danger"
						vm.alert.visible = true
						vm.alert.msg = response.msg

					}
					
				})
			},
			fetchTransactions (filtering) {
				let vm = this

				for (var key in filtering) {
					if (filtering[key] == null || filtering[key] == 0 || filtering[key] == "") {
						filtering[key] = null
					}
				}

				this.spinnerVisible = true,
				this.getJSON(window.apiBase + "transaction/get/"+filtering.date_from+"/"+filtering.date_to+"/"+filtering.group_id+"/"+filtering.cat_id+"/"+filtering.amount_low+"/"+filtering.amount_high+"/"+filtering.keyword+"/"+filtering.user_id).then(function(response){

					vm.spinnerVisible = false

					if (response.status == 'success') {
						vm.transactions = response.transactions
					}
				})

				if (this.filtering.keyword == null)
					this.filtering.keyword = ""
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
			filterMessage() {
				let message = "Filtering ";

				if (this.filtering.group_id != null)
					message += " by group and"

				if (this.filtering.cat_id != null)
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
					message += " amounts between " + this.filtering.amount_low.tofixed(2) + " and"

				if (this.filtering.amount_high != null)
					message += " " + this.filtering.amount_high.toFixed(2)
				else if (this.filtering.amount_low != null)
					message += " above"

				if (this.filtering.keyword != null && this.filtering.keyword != '')
					message += " with description containing '" + this.filtering.keyword + "'"

				return message
			}
		},
		created () {
			let vm = this

			this.resetFiltering()

			this.filtering.date_from = this.currentMonthFirstDay
			this.filtering.date_to = this.currentMonthLastDay

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
</style>

