<template>
<div>
	<div class="section-outer">
		<spinner :spinner-visible="spinnerVisible"></spinner>
		<div class="row">
			<div class="col-sm-5">
				<section>
					<h2>Summary</h2>

					<div class="panel panel-default" :class="{'fixed-top-left' : panelFixed }">
						<div class="panel-heading">Planned</div>
						<table class="table">
							<tbody>
								<tr>
									<th>Total Planned Income</th>
									<td class="bg-success number">{{ totalIncomes }}</td>
								</tr>
								<tr>
									<th>Total Allocated</th>
									<td class="bg-outflows number">{{ grandTotals.alloc.toFixed(2) }}</td>
								</tr>
								<tr>
									<th>Planned Surplus</th>
									<td class="number" :class="{ 'text-success': (grandTotals.plannedSurplus > 0), 'text-danger': (grandTotals.plannedSurplus < 0) }">{{ grandTotals.plannedSurplus.toFixed(2) }}</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="panel panel-default">
						<div class="panel-heading">Actual</div>
						<table class="table">
							<tbody>

								<tr>
									<th>Total Inflows This Month</th>
									<td class="bg-success number">{{ grandTotals.inflows.toFixed(2) }}</td>
								</tr>
								<tr>
									<th>Total Outflows This Month</th>
									<td class="bg-outflows number">{{ grandTotals.outflows.toFixed(2) }}</td>
								</tr>
								<tr>
									<th>Total Budget Balance</th>
									<td class="number" :class="{ 'text-success': (grandTotals.budgetBalance > 0), 'text-danger': (grandTotals.budgetBalance < 0) }">{{ grandTotals.budgetBalance.toFixed(2) }}</td>
								</tr>
								<tr>
									<th>Actual Current Surplus</th>
									<td class="number" :class="{ 'text-success': (grandTotals.actualSurplus > 0), 'text-danger': (grandTotals.actualSurplus < 0) }">{{ grandTotals.actualSurplus.toFixed(2) }}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</section>
			</div>
			<div class="col-sm-7">
				<section>
					<h2>Income</h2>

					<table class="table">
						<thead>
							<tr>
								<th class="btn-col"></th>
								<th>Income Source</th>
								<th class="number">Amount</th>
								<th class="btn-col"></th>
							</tr>
						</thead>
						<draggable
							element='tbody'
							v-model="income_sources"
							:options="{handle:'.sort-income'}"
							v-on:update="autoSave(income_sources,'budget','save-order')"
							>
							<tr v-for="income in localIncomeSources">
								<td class="btn-col has-control">
									<i class="fa fa-fw fa-arrows icon-button sort-income" v-if="budgetEditable"></i>
								</td>
								<td :class="{'has-control': budgetEditable}" class="income-source">
									<i v-if="income.progress >= 100 && budgetInCurrentMonth" class="fa fa-check-circle-o progress-icon"></i>
									<span v-if="income.progress < 100 && budgetInCurrentMonth" class="progress-value">{{Math.round(income.progress)}}% </span>
									<div v-if="budgetInCurrentMonth" class="progress-bar" :style="{width: income.progress +'%'}"></div>

									<div class="value-container">
										<input 
											v-if="income.descEditable && budgetEditable" 
											v-on:blur="income.descEditable = false" 
											v-on:change="autoSave(income,'income','save')" 
											v-model="income.source" 
											type="text" 
											class="form-control" 
											autofocus>

										<div v-else v-on:click="income.descEditable = true">{{ income.source }}</div>
									</div>

								</td>
								<td class="number col-amounts" :class="{'has-control': budgetEditable}" style="width: 120px">
									<input type="number" 
										v-if="budgetEditable"
										step="0.01" 
										name="amount_alloc" 
										placeholder="$ 0.00" 
										class="form-control" 
										v-on:change="autoSave(income, 'income', 'save')" 
										v-model="income.amount">
									<div v-else>{{ income.amount }}</div>
								</td>
								<td class="btn-col has-control">
									<i class="fa fa-fw fa-remove icon-button"
										v-on:click="deleteItem('income',income.id)"
										v-if="budgetEditable"></i>
								</td>
							</tr>
						</draggable>
						<tfoot>
							<tr>
								<th></th>
								<th class="number">Total Planned</th>
								<th class="number">{{ totalIncomes }}</th>
								<th class="btn-col">
									<i class="fa fa-fw fa-plus icon-button" 
										title="Add new income source" 
										v-on:click="addIncome" 
										v-if="budgetEditable"></i>
								</th>
							</tr>
							<tr>
								<th></th>
								<th class="number">Total Actual</th>
								<th class="number">{{ totalActualIncome }}</th>
								<th></th>
							</tr>
						</tfoot>
					</table>
				</section>
			</div>
		</div>
	</div>
	<section class="categories">

		<h2>Budget</h2>

		<div class="row" v-if="!localIsOffline">

			<div class="col-md-8 date-controls">
				<div class="year-selector date-selector">
					<button class="btn btn-info" v-on:click="changeBudgetYear(false)"><i class="fa fa-chevron-left"></i></button>
					<div class="selected-date">{{budget_year}}</div>
					<button class="btn btn-info" v-on:click="changeBudgetYear(true)"><i class="fa fa-chevron-right"></i></button>
				</div>

				<button class="btn btn-info jump-to-current-month" v-on:click="jumpToCurrentMonth">Jump to Current Month</button>

				<div class="month-selector date-selector">
					<button class="btn btn-info" v-on:click="decrementBudgetMonth"><i class="fa fa-chevron-left"></i></button>
					<div class="selected-date">{{budgetMonthName}}</div>
					<button class="btn btn-info" v-on:click="incrementBudgetMonth"><i class="fa fa-chevron-right"></i></button>
				</div>
			</div>
			<div class="col-md-4">
				<!--<div class="alert pull-right" :class="alert.class" v-if="alert.visible">{{ alert.msg }} &nbsp;
					<button v-if="noBudgetFound" class='btn btn-primary' v-on:click="copyBudget">Copy Budget</button>
				</div>-->
			</div>
		</div>

		<div style="clear: both;"></div>
		<div style="overflow-x: auto" class="budget-tables">
			<table class="table">
				<thead>
					<tr>
						<th class="btn-col">
							<div v-if="!localIsOffline">
								<button v-if="!editCategories" class="btn btn-warning" v-on:click="editCategories = true"><i class="fa fa-pencil"></i></button>
								<button v-else class="btn btn-success" v-on:click="doneEditingBudget"><i class="fa fa-check"></i> Done</button>
							</div>
						</th>
						<th class="col-cat">Group/Category</th>
						<th class="col-amounts">Allocated</th>
						<th class="col-amounts">Carryover</th>
						<th class="col-amounts">Inflows</th>
						<th class="col-amounts">Outflows</th>
						<th class="col-amounts">Balance</th>
					</tr>
				</thead>
				<tbody v-if="localIsOffline"> 
					<tr>
						<td colspan="7">Since you appear to be offline, we can't retrieve your current budget. The budget being displayed is the most recent locally saved copy {{budgetLastSaved}}.</td>
					</tr>
				</tbody>
			</table>

			<form v-if="editCategories">
				<table v-for="group in masterGroupsLocal" v-if="group.name != 'Surplus'" class="table group-table">
					<thead>
						<tr class="group-heading">
							<td class="btn-col has-control"></td>
							<th>
								<input v-if="group.name != 'Surplus' && budgetEditable && group.descEditable"
									type="text" step="0.01" name="name" placeholder="[Group Name]" 
									class="form-control" 
									v-on:change="autoSave(group, 'group', 'save')"
									v-on:blur="group.descEditable = false"
									v-model="group.name" >
								<div v-else v-on:click="group.descEditable = true">{{ group.name }}</div>

							</th>
							<th colspan="4"></th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td></td>
							<td colspan="5">
								<div v-for="cat in group.categories">
									<label>
										<input type="checkbox" v-model='cat.isSelected' v-on:change="autoSave(cat,'budget','save-categories')" :name="cat.id">
										{{ cat.description }}
									</label>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</form>

			<draggable 
				v-model="groups"
				:options="{handle:'.sort-group'}" 
				v-on:update="autoSave(groups,'budget','save-order')"
				v-else >

				<table v-for="group in localGroups" class="table group-table">	
					<thead>
						<tr class="group-heading">
							<td class="btn-col has-control">
								<i v-if="group.categories && group.name != 'Surplus' && !localIsOffline" class="fa fa-fw fa-arrows icon-button sort-group" title="Re-order this group"></i>
							</td>
							<th>
								<input v-if="group.name != 'Surplus' && budgetEditable && group.descEditable"
									type="text" step="0.01" name="name" placeholder="[Group Name]" 
									class="form-control" 
									v-on:change="autoSave(group, 'group', 'save')"
									v-on:blur="group.descEditable = false"
									v-model="group.name" >
								<div v-else v-on:click="group.descEditable = true">{{ group.name }}</div>

							</th>
							<th class="number" style="width: 120px;">{{ group.totalAlloc ? group.totalAlloc.toFixed(2) : '' }}</th>
							<th class="number col-amounts">{{ group.totalCarryover.toFixed(2) }}</th>
							<th class="number col-amounts">{{ group.totalInflows.toFixed(2) }}</th>
							<th class="number col-amounts">{{ group.totalOutflows.toFixed(2) }}</th>
							<th class="number col-amounts">{{ group.totalBalance.toFixed(2) }}</th>
							<!--<th class="btn-col has-control">
								<i 
									v-if="group.categories && group.name != 'Surplus' && budgetEditable" 
									class="fa fa-fw fa-remove icon-button" 
									v-on:click="deleteItem('group',group.id)">
								</i>
							</th>-->
						</tr>
					</thead>

					<draggable
						v-model="group.categories" 
						element="tbody" 
						:options="{handle: '.sort-row'}" 
						v-on:update="autoSave(group.categories,'budget','save-order')">

						<tr v-for="cat in group.categories">
							<td class="td-indent btn-col has-control">
								<i v-if="cat.description != 'Surplus' && budgetEditable" class="fa fa-fw fa-arrows icon-button sort-row"></i> 
							</td>
							<td class="td-indent" :class="{'has-control':cat.descEditable && cat.description != 'Surplus' }">
								<a :href="cat.link">{{ cat.description }}</a>
							</td>
							<td :class="{'has-control': budgetEditable}" class="number">
								<input v-if="cat.description != 'Surplus' && budgetEditable" type="number" step="0.01" name="amount_alloc" placeholder="$ 0.00" class="form-control" v-on:change="autoSave(cat, 'budget', 'save')" v-model="cat.amount_alloc" >

								<div v-else>{{cat.amount_alloc ? parseFloat(cat.amount_alloc).toFixed(2) : ''}}</div>
							</td>
							<td class="bg-info number">{{ cat.carryOver ? cat.carryOver.toFixed(2) : '' }}</td>
							<td class="bg-success number">{{ cat.inflowsAndIncome ? cat.inflowsAndIncome.toFixed(2) : '' }}</td>
							<td class="bg-outflows number">{{ cat.outflows ? parseFloat(cat.outflows).toFixed(2) : '' }}</td>
							<td class="bg-info number" :class="{'text-danger' : cat.balanceAfterInjection < 0}">{{ cat.balanceAfterInjection < 0 ? '('+cat.balanceAfterInjection.toFixed(2)+')' : cat.balanceAfterInjection.toFixed(2) }}</td>
							<!--<td class="btn-col has-control"><i v-if="cat.description != 'Surplus' && budgetEditable" class="fa fa-fw fa-remove icon-button" v-on:click="deleteItem('budget',cat.budget_id)"></i></td>-->
						</tr>
					</draggable>
				</table>

			</draggable>
			
		</div>

	</section>

	<ModalDialog
		v-if="confirmDialog.visible" 
		:title="confirmDialog.title" 
		:modal-visible="confirmDialog.visible" 
		:confirm-button-text="confirmDialog.buttonText"
		v-on:confirm="confirmationDialogResponse(true)"
		v-on:closeModal="confirmationDialogResponse(false)"
		> {{confirmDialog.message}}
	</ModalDialog>
</div>
</template>

<script type="text/javascript">
	import draggable from 'vuedraggable'
	import Spinner from '../components/Spinner'
	import ModalDialog from '../components/ModalDialog'

	export default {
		name: 'BudgetManager',
		props: ['masterGroups','accountBalanceTotals','isOffline'],
		components: {
			draggable,
			Spinner,
			ModalDialog
		},
		data () {
			return {
				groups: [],
				budget_year: 0,
				budget_month: 0,
				budgetInCurrentMonth: false,
				income_sources: [],
				incomeTransactions: [],
				budgetEditable: true,
				noBudgetFound: false,
				panelFixed: false,
				confirmDialog : {
					visible: false,
					title: "",
					message: "",
					successFunction : "",
					parameters: ""
				},
				spinnerVisible: false,
				editCategories: false,
				thisMonthIncome: 0,
				grandTotals : {
					alloc: 0,
					inflows: 0,
					outflows: 0,
					plannedSurplus: 0,
					budgetBalance: 0,
					actualSurplus: 0
				},
				localIsOffline: false,
				budgetLastSaved: localStorage.budgetLastSavedLocally
			}
		},
		watch: {
			budget_month () {
				this.fetchBudget()
			},
			isOffline() {
				this.localIsOffline = this.isOffline
			}
		},
		computed: {
			surplus() {
				return {
					carryOver: 0,
					inflows: 0,
					outflows: 0,
					balance: parseFloat(this.accountBalanceTotals.onBudget) - parseFloat(this.grandTotals.budgetBalance),

				}
			},
			localGroups() {

				let vm = this
				let localGroups = [];

				vm.grandTotals.alloc = 0
				vm.grandTotals.inflows = 0
				vm.grandTotals.outflows = 0
				let totalBudgetBalance = 0

				let incomeRemaining = parseFloat(this.thisMonthIncome)

				this.groups.forEach(function(group, index) {

					let groupCarryover = 0
					let totalAlloc = 0
					let totalInflows = 0
					let totalOutflows = 0
					let totalBalance = 0

					group.categories.forEach(function(cat, index) {

						cat.carryOver = parseFloat(cat.tot_prev_injected) - parseFloat(cat.prev_outflows) + parseFloat(cat.prev_inflows)

						let newCatInflows = 0;

						if (incomeRemaining >= parseFloat(cat.amount_alloc)) {
							incomeRemaining -= parseFloat(cat.amount_alloc)
							newCatInflows = parseFloat(cat.amount_alloc) + parseFloat(cat.inflows)
							cat['balanceAfterInjection'] = cat.balance + parseFloat(cat.amount_alloc)
						}
						else {
							
							newCatInflows = incomeRemaining + parseFloat(cat.inflows)
							cat['balanceAfterInjection'] = cat.balance + incomeRemaining
							incomeRemaining = 0
						}

						cat['inflowsAndIncome'] = newCatInflows;

						let balanceAfterInjection = 0

						totalAlloc += cat.amount_alloc ? parseFloat(cat.amount_alloc) : 0
						groupCarryover += cat.carryOver ? parseFloat(cat.carryOver) : 0
						totalInflows += cat.inflowsAndIncome ? parseFloat(cat.inflowsAndIncome) : 0
						totalOutflows += cat.outflows ? parseFloat(cat.outflows) : 0

						if (cat.id != 1) //exclude surplus from total balance calc
							totalBalance += cat.balanceAfterInjection ? parseFloat(cat.balanceAfterInjection) : 0
						else
							vm.grandTotals.actualSurplus = cat.balanceAfterInjection ? parseFloat(cat.balanceAfterInjection) : 0

						vm.$set(cat,'descEditable',false)

						let d = new Date()
						let last_day_of_month = new Date(vm.budget_year, d.getMonth() + 1, 0)
						last_day_of_month = last_day_of_month.getDate()

						let lastDay = vm.budget_year + "-" + vm.budget_month + "-" + last_day_of_month

						let link = "/transactions?group_id="+group.id+"&cat_id="+cat.id+"&date_from="+vm.budget_year+"-"+vm.budget_month+"-01&date_to="+lastDay

						vm.$set(cat,'link',link)
					})

					group['totalAlloc'] = totalAlloc
					group['totalCarryover'] = groupCarryover
					group['totalInflows'] = totalInflows
					group['totalOutflows'] = totalOutflows
					group['totalBalance'] = totalBalance

					totalBudgetBalance += totalBalance

					vm.grandTotals.budgetBalance = totalBudgetBalance

					vm.grandTotals.alloc += group['totalAlloc']
					vm.grandTotals.inflows += group['totalInflows']
					vm.grandTotals.outflows += group['totalOutflows']

					vm.$set(group,'descEditable',false)

					localGroups.push(group)
				});

				return localGroups
			},
			totalIncomes () {
				let vm = this

				this.grandTotals.plannedSurplus = 0

				let total = 0;
				this.income_sources.forEach(function(inc, index) {
					total += parseFloat(inc.amount)

					vm.$set(inc,'descEditable',false)
				});

				this.grandTotals.plannedSurplus = total - this.grandTotals.alloc

				return total.toFixed(2)
			},
			budgetMonthName () {
				let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

				return monthNames[this.budget_month-1]
			},
			masterGroupsLocal () {
				let vm = this

				let localgroups = this.masterGroups

				//check to see if categories in master group are included in budget or not, and add a property to reflect that
				localgroups.forEach(function(group, index){
					group.categories.forEach(function(cat, index) {

						if (!('isSelected' in cat)) {

							//search in the budget groups array for this category
							let isSelected = false
							let budget_item_id = 0
							vm.groups.forEach(function(budGroup, index){
								budGroup.categories.forEach(function(budCat, index) {
									if (budCat.id == cat.id) {
										isSelected = true
										budget_item_id = budCat.budget_id
									}
								})
							});

							vm.$set(cat,'isSelected',isSelected)
							vm.$set(cat,'budget_item_id',budget_item_id)
						}

					})
				});

				return localgroups
			},
			localIncomeSources() {
				let newIncomes = []
				let vm = this

				this.income_sources.forEach(function(income, index) {
					//total up incomes under this source
					let this_total = 0

					vm.incomeTransactions.forEach(function(tran,index) {
						if (tran.description == income.source) {
							//console.log("match")
							this_total += parseFloat(tran.amount)
						}

					})

					this_total = this_total / income.amount * 100

					vm.$set(income,"progress",this_total)

					newIncomes.push(income)
				})

				return newIncomes
			},
			totalActualIncome() {
				let total = 0
				this.incomeTransactions.forEach(function(inc, index){
					total += parseFloat(inc.amount)
				})

				return total
			},
			incomeDifferencePlannedActual() {
				return this.totalIncomes - this.totalActualIncome
			}
		},
		methods: {
			dateIsPast(year, month) {
				let d = new Date();

				let past = false
				if (year == d.getFullYear()) {
					if (month >= d.getMonth() + 1) {
						return false
					}
					else {
						return true
					}
				}
				else if (year > d.getFullYear()) {
					return false
				}
				else {
					return true
				}
			},
			setBudgetEditState() {
				if (this.dateIsPast(this.budget_year, this.budget_month)) {
					this.budgetEditable = false
				}
				else {
					this.budgetEditable = true
				}
			},
			jumpToCurrentMonth () {
				let d = new Date();
				
				this.budget_year = d.getFullYear()
				this.budget_month = d.getMonth() + 1

				this.setBudgetInCurrentMonth()
			},
			changeBudgetYear(up) {
				if (up) {
					this.budget_year++
				}
				else {
					this.budget_year--
				}
				this.fetchBudget()
				this.setBudgetInCurrentMonth()
			},
			incrementBudgetMonth () {
				if (this.budget_month == 12) {
					this.budget_month = 1
					this.budget_year++
				}
				else 
					this.budget_month++

				this.setBudgetInCurrentMonth()

			},
			decrementBudgetMonth() {
				if (this.budget_month == 1) {
					this.budget_month = 12
					this.budget_year--
				}
				else 
					this.budget_month--

				this.setBudgetInCurrentMonth()
			},
			addIncome() {
				this.income_sources.push({
					source: "[New Income Source]",
					amount: 0,
					priority: 999
				});
			},
			addGroup() {
				this.groups.push({
					name: "[New Group]",
					categories: [],
					priority: 999
				});
			},
			doneEditingBudget () {
				this.editCategories = false
				this.fetchBudget()
			},
			setBudgetInCurrentMonth ()
			{
				let d = new Date()
				if (d.getFullYear() == this.budget_year && d.getMonth()+1 == this.budget_month)
					this.budgetInCurrentMonth = true
				else
					this.budgetInCurrentMonth = false
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
			executeDelete(parameters) {
				let payload = {
					id : parameters.id
				}

				let vm = this

				this.postData(window.apiBase + parameters.resource + "/delete",payload).then(function(response) {
					if (response.status == 'success') {

						vm.$emit("alertUpdate",{
							class: "alert-danger",
							msg: "Item deleted",
							visible: true
						})

						vm.fetchBudget()
					}
					else {

						vm.$emit("alertUpdate",{
							class: "alert-danger",
							msg: response.msg,
							visible: true
						})

					}
					
				})
			},
			confirmationDialogResponse (response) {
				if (response) {
					this[this.confirmDialog.successFunction](this.confirmDialog.parameters)
				}
				this.confirmDialog.visible = false
			},
			fetchBudget() {
				let vm = this

				this.spinnerVisible = true

				this.getJSON(window.apiBase + "budget/get-budget/"+this.budget_year+"/"+this.budget_month).then(function(json){

					vm.spinnerVisible = false

					let alert_class = "alert-danger"
					let alert_msg = ""
					let alert_visible = true

					if (json.status == "failed") {

						if (json.error == "not found") {

							vm.confirmDialog.message = "There is no budget for this month. Would you like to copy over the previous budget?"
							vm.confirmDialog.title = "Copy Last Budget?"
							vm.confirmDialog.successFunction = "copyBudget"
							vm.confirmDialog.buttonText = "Copy Budget"
							vm.confirmDialog.visible = true

							vm.groups = []
							vm.income_sources = []
						}
						else {
							alert_msg = json.message
						}
						
					}
					else if (json.status == "offline") {

						alert_msg = "You appear to be offline, the displayed budget may not be 100% current."

						vm.localIsOffline = true
						vm.budgetEditable = false

						vm.groups = JSON.parse(localStorage.budgetGroups)
						vm.income_sources = JSON.parse(localStorage.budgetIncomeSources)
						vm.thisMonthIncome = localStorage.budgetThisMonthIncome

					}
					else {
						vm.groups = json.groups
						vm.income_sources = json.income_sources
						vm.thisMonthIncome = json.total_income

						let d = new Date()
						let currentDate = d.getFullYear() +"-"+(d.getMonth()+1)+"-"+d.getDate() + " " + d.getHours() + ":" +d.getMinutes()

						localStorage.budgetGroups = JSON.stringify(json.groups)
						localStorage.budgetIncomeSources = JSON.stringify(json.income_sources)
						localStorage.budgetThisMonthIncome = json.total_income
						localStorage.budgetLastSavedLocally = currentDate

						alert_visible = false

						vm.setBudgetEditState()
					}

					vm.$emit("alertUpdate",{
						class: alert_class,
						msg: alert_msg,
						visible: alert_visible
					})
					
				})
			},
			copyBudget () {
				let vm = this

				vm.$emit("alertUpdate",{
					class: "alert-warning",
					msg: "Copying last budget...",
					visible: true
				})

				this.noBudgetFound = false

				let payload = {
					year: this.budget_year,
					month: this.budget_month
				}

				this.postData(window.apiBase + "budget/copy-last", payload).then(function(response) {
					
					let alert_class = "alert-danger"
					if (response.status == 'success') {
						alert_class = "alert-success"
						vm.fetchBudget()
					}

					vm.$emit("alertUpdate",{
						class: alert_class,
						msg: response.msg,
						visible: true
					})
				})
			},
			autoSave (data, resource, method) {
				let vm = this

				let payload = {}

				if (resource == "budget") {
					if (method == "save") {

						payload = {
							id: data.budget_id,
							amount_alloc: data.amount_alloc
						}
					}
					else if (method == "save-order") {
						//this.$emit('updated',this.categories)

						let type = ""
						let list = []
						let id_key = 'id';
						//build list to include only id and priority
						if ("categories" in data[0]) {
							//groups
							type = "groups"
						}
						else if ("source" in data[0]) {
							//income sources
							type = 'income_sources'
						}
						else {
							type = "budgets"
							id_key = 'budget_id'
						}

						data.forEach(function(item, ind) {
							let item_vals = {
								id: item[id_key],
								priority: item.priority
							}
							list.push(item_vals)
						})

						payload = {
							year: this.budget_year,
							month: this.budget_month,
							list: JSON.stringify(list),
							list_type: type
						}
					}
					else if (method == 'save-categories') {
						if (data.isSelected) {
							method = 'save'
							payload = {
								priority: 999,
								cat_id : data.id,
								bud_month : this.budget_month,
								bud_year: this.budget_year,
							}
						}
						else {
							method = 'delete'
							payload = {
								id : data.budget_item_id
							}
						}
					}
				}
				else if (resource == 'category') {
					payload = {
						id: data.id,
						description: data.description,
						group_id : data.group_id
					}
				}
				else if (resource == 'group') {
					payload = {
						id: data.id,
						name: data.name
					}
				}
				else if (resource == 'income') {
					payload = {
						id: data.id,
						source: data.source,
						amount: data.amount,
						bud_year: this.budget_year,
						bud_month: this.budget_month,
						priority: data.priority
					}
				}

				vm.$emit("alertUpdate",{
					class: "alert-warning",
					msg: "Saving...",
					visible: true
				})

				this.postData(window.apiBase + resource + "/" + method, payload).then(function(response){

					if (response.status == 'success') {

						//update id that was sent down in case of a create
						data.id = response.id

						let d = new Date()

						vm.$emit("alertUpdate",{
							class: "alert-success",
							msg: "Saved at "+d.getHours() + ":" +d.getMinutes()+ ":"+d.getSeconds(),
							visible: true
						})
					}
				})
			},
			handleScroll() {
				if (document.body.scrollTop > 150)
					this.panelFixed = true
				else
					this.panelFixed = false
			},
			fetchIncomeTransactions()
			{
				let vm = this

				let d = new Date();

				let last_day_of_month = new Date(d.getFullYear(), d.getMonth() + 1, 0)
				last_day_of_month = last_day_of_month.getDate()

				let filters = [
					['tran_date >=', d.getFullYear()+"-"+(d.getMonth()+1)+"-01"],
					['tran_date <=', d.getFullYear()+"-"+(d.getMonth()+1)+"-"+last_day_of_month],
					['cat_id', 0],
				]

				let query = "?filters="+JSON.stringify(filters)

				this.getJSON(window.apiBase+"transaction/get"+query).then(function(response){
					vm.incomeTransactions = response
				})
			}
		},
		created () {
			this.jumpToCurrentMonth()
			this.fetchIncomeTransactions()

			window.addEventListener('scroll', this.handleScroll);
		},
		destroyed () {
			window.removeEventListener('scroll', this.handleScroll);
		}
	}
</script>

<style type="text/css" scoped>

	.table .group-heading th, .table .group-heading td {
		background-color: #e0e0e0;
	}

	thead .btn-col {
		width: 30px
	}

	.fixed-top-left {
		position: fixed;
		top: -75px;
		box-shadow: 1px 1px 10px black;
		z-index: 5;
		animation: slideDownFixed 0.3s;
		transition: top 1s;
	}

	.fixed-top-left:hover {
		top: 50px;
	}

	@keyframes slideDownFixed {
		from {
			top: -100px;
			
		}

		to {
			top: -75px;
		}
	}

	td.income-source {
		position: relative;
		overflow: hidden;
	}

	.income-source .progress-bar {
		position: absolute;
		z-index: 1;
		top: 0;
		left: 0;
		height: calc(100% + 1px);
		background-color: #dff0d8;
	}

	.progress-icon {
		position: absolute;
		color: #428627;
		font-size: 18px;
		right: 5px;
		top: 10px;
		z-index: 2
	}

	.income-source .value-container {
		position: relative;
		z-index: 3;
	}

	.income-source .progress-value {
		position: absolute;
		right: 5px;
		z-index: 2;
	}

	.budget-tables table {
		min-width: 750px
	}

	.group-table {
		margin-bottom: 0;
	}

	.date-selector {
		text-align: center;
		margin-bottom: 10px;
		display: inline-block;
	}

	.date-selector .selected-date, .date-selector button {
		vertical-align: top;
	}

	.date-selector .selected-date {
		display: inline-block;
		font-size: 18pt;
		margin: 0;
		margin-left: 15px;
		margin-right: 15px;
		width: 120px;
	}

	.year-selector .selected-date {
		width: 60px;
	}

	.jump-to-current-month {
		margin-top: 0;
		vertical-align: top;
		margin-left: 20px;
		margin-right: 20px;
	}

	.sort-row, .sort-group {
		cursor: pointer;
	}

	@media (max-width: 675px) {
		.date-controls .date-selector, .date-controls .jump-to-current-month {
			display: block;
			max-width: 400px;
			margin: auto;
			margin-bottom: 10px;
		}

		.date-controls .selected-date {
			width: calc(100% - 130px);
		}
	}

	@media (max-width: 500px) {
		.progress-icon, .income-source .progress-value {
			display: none;
		}
	}

</style>