<template>
	<div class="dashboard" v-if="loggedIn">

		<DashboardHeader
			v-on:showModal="showTransactionModal"
			:menu-showing="menuShowing"
			:spinner-visible="spinnerVisible"
			:page-title="pageTitle"
			:page-icon="pageIcon"
			:bank-accounts="bankAccounts"
			:pages-meta="pagesMeta"
			:accountBalanceTotals="accountBalanceTotals"
			:is-offline="isOffline"
			:transactions-synced="transactionsSynced"
			:alert="alert"
			v-on:navigate="navigate"
			v-on:toggleMenu="menuShowing ? menuShowing = false : menuShowing = true"
			v-on:showAccountsModal="showAccountsModal"
			v-on:showImportModal="importModalVisible = true"
			>
		</DashboardHeader>

		<div class="section-wrapper" :class="{ menuShowing: menuShowing }" v-on:click="hideMenu">
			
			<CategoryManager 
				v-if="currentRoute == '/categories'" 
				:groups="masterGroups"
				v-on:fetchGroups="fetchGroups"
				v-on:alertUpdate="updateAlert">
			</CategoryManager>
			<AccountManager 
				v-if="currentRoute == '/accounts'" 
				:bank-accounts="bankAccounts"
				v-on:bankAccountsChange="fetchBankAccounts"
				v-on:editAccount="showAccountsModal"
				v-on:alertUpdate="updateAlert"
			>
			</AccountManager>
			<UserManager 
				v-if="currentRoute == '/users'" 
				v-on:alertUpdate="updateAlert"
			>
			</UserManager>
			<TransactionLog 
				v-if="currentRoute == '/transactions'" 
				:groups='masterGroups'
				:categories='masterCategories'
				:bank-accounts="bankAccounts"
				:is-offline="isOffline"
				v-on:showTransactionModal="showTransactionModal"
				v-on:alertUpdate="updateAlert"
				>
			</TransactionLog>
			<BudgetManager 
				v-if="currentRoute == '/' || currentRoute == '/budget'" 
				:master-groups="masterGroups" 
				:accountBalanceTotals="accountBalanceTotals"
				:is-offline="isOffline"
				v-on:alertUpdate="updateAlert">
			</BudgetManager>
			<TransactionClearing 
				v-if="currentRoute == '/clear-imported-transactions'"
				:bank-accounts="bankAccounts"
				:groups = "masterGroups" 
				v-on:alertUpdate="updateAlert">
			</TransactionClearing>
			<MyProfile 
				v-if="currentRoute == '/my-profile'"
				v-on:alertUpdate="updateAlert">
			</MyProfile>
			
		</div>

		<TransactionModal
			:modal-visible="transactionModalVisible"
			:groups="masterGroups"
			:incomes="incomeSources"
			:field-data="transactionData"
			:bank-accounts="bankAccounts"
			tran-type="Transaction"
			v-on:showModal="showTransactionModal"
			v-on:closeModal="closeTransactionModal"
			v-on:transactionSubmitted="refreshTransactionData"
			v-on:isOffline="isOffline = true"
			v-on:isOnline = "isOffline = false">	
		</TransactionModal>

		<ModalDialog
			title="Add/Edit Bank Account" 
			:modal-visible="accountModalVisible" 
			confirm-button-text="Save"
			v-on:confirm="saveBankAccount"
			v-on:closeModal="accountModalVisible=false">
			
			<FormGroup label="Description" col-class="col-md-4">
				<input type="text" v-model="modalBankAccount.description" class="form-control">
			</FormGroup>

			<FormGroup label="" col-class="col-md-4">
				<label>
					<input type="checkbox" 
						v-bind:true-value="1"
  						v-bind:false-value="0" 
  						v-model="modalBankAccount.off_budget">
					Account is Not Tracked in Budget
				</label>
			</FormGroup>

			<hr>

			<FormGroup label="" col-class="col-md-4">
				<label>
					<input type="checkbox" 
  						v-model="reconcileAccount">
					Reconcile Account
				</label>
			</FormGroup>

			<div v-if="reconcileAccount">
				<FormGroup label="Reconciled" col-class="col-md-4">
					<DateField 
						v-model="modalBankAccount.reconcile_date" extra-classes="form-control">
					</DateField>
				</FormGroup>

				<FormGroup label="Reconciled Balance" col-class="col-md-4">
					<input type="number" step="0.01" v-model="modalBankAccount.reconcile_balance" class="form-control">
				</FormGroup>
			</div>

		</ModalDialog>

		<ModalDialog
			title="Import CSV Transactions" 
			:modal-visible="importModalVisible" 
			confirm-button-text="Proceed to Import"
			v-on:confirm="beginTransactionImport"
			v-on:closeModal="importModalVisible=false"
			:form-action="fileUpload.target"
			form-enctype="multipart/form-data"
			:submit-visible="fileUpload.submitVisible">
			
			<div class="dropbox">
				<fileupload 
					class="input-file"
					:target="fileUpload.target" 
					action="POST"
					accept=".csv"
					v-on:start="startUpload"
					v-on:finish="finishUpload"
					v-on:progress="uploadProgress">
				</fileupload>
				<!--<input type="file" name="fileUpload" accept=".csv" class="input-file">-->
				<p>
				  {{ fileUpload.msg }}
				</p>
			</div>

			<FormGroup label="Formatting" col-class="col-md-4">
				<select class="form-control" v-model="fileUpload.fileFormat">
					<option value="CIBC">CIBC</option>
					<option value="RBC">RBC</option>
					<option value="PC Financial">PC Financial</option>
				</select>
			</FormGroup>

			<div class="alert" :class="importAlert.class" v-if="importAlert.visible" v-html="importAlert.msg"></div>

		</ModalDialog>

	</div>
</template>

<script type="text/javascript">
	import BudgetManager from '../pages/BudgetManager'
	import MyProfile from '../pages/MyProfile'
	import TransactionClearing from '../pages/TransactionClearing'
	import UserManager from '../pages/UserManager'
	import AccountManager from '../pages/AccountManager'
	import CategoryManager from '../pages/CategoryManager'
	import TransactionLog from '../pages/TransactionLog'
	import TransactionModal from '../components/TransactionModal'
	import DashboardHeader from '../components/DashboardHeader'
	import FormGroup from '../components/FormGroup'
	import ModalDialog from '../components/ModalDialog'
	import DateField from "../components/DateField"
	import FileUpload from 'vue-simple-upload/dist/FileUpload'

	export default {
		name: 'Dashboard',
		components: {
			TransactionModal,
			DashboardHeader,
			BudgetManager,
			CategoryManager,
			UserManager,
			TransactionLog,
			MyProfile,
			FormGroup,
			ModalDialog,
			DateField,
			AccountManager,
			TransactionClearing,
			'fileupload': FileUpload
		},
		data () {
			return {
				loggedIn: false,
				transactionModalVisible: false,
				alert: {
					msg: "",
					class: "",
					visible: false,
					errors: []
				},
				transactionData: {
					description: "",
					tran_date: null,
					amount: "",
					account_id: 0,
					cat_id: 0,
					in_out: 0
				},
				fileUpload: {
					fieldName: "",
					msg: "Drag your file here or click to open dialog",
					target: window.apiBase+"import/upload-csv?key="+localStorage.getItem("apiKey"),
					submitVisible: false,
					responseFilename: "",
					fileFormat: ""
				},
				modalBankAccount: {},
				bankAccounts: [],
				accountModalVisible: false,
				importModalVisible: false,
				importAlert: {
					msg: "",
					visible: false,
					class: ""
				},
				reconcileAccount: false,
				menuShowing : false,
				spinnerVisible: false,
				pageTitle: "",
				pageIcon: "",
				masterGroups: [],
				incomeSources: [],
				pagesMeta: {
					"/budget" : {
						title: "Budget",
						icon: "fa-pie-chart",
						nav: true,
						offlinePage: true,
						permRequired: ["Demo", 'User','Admin','Root']
					},
					"/transactions" : {
						title: "Transaction Log",
						icon: "fa-list-ul",
						nav: true,
						offlinePage: true,
						permRequired: ["Demo", 'User','Admin','Root']
					},
					"/clear-imported-transactions" : {
						title: "Clear Pending Imports",
						icon: "fa-clock-o",
						nav: false,
						offlinePage: false,
						permRequired: ["Demo", 'User','Admin','Root']
					},
					"/categories" : {
						title: "Categories & Groups",
						icon: "fa-tags",
						nav: true,
						offlinePage: false,
						permRequired: ["Demo", 'User','Admin','Root']
					},
					"/accounts" : {
						title: "Bank Accounts",
						icon: "fa-bank",
						nav: true,
						offlinePage: false,
						permRequired: ["Demo", 'User','Admin','Root']
					},
					'/my-profile' : {
						title: "My Profile",
						icon: "fa-user-circle",
						nav: true,
						offlinePage: false,
						permRequired: ["Demo", 'User','Admin','Root']
					},
					"/users" : {
						title : "Users",
						icon: "fa-users",
						nav: true,
						offlinePage: false,
						permRequired: ['Admin','Root']
					}
				},
				currentRoute: "/"+this.$route.fullPath.split("?")[0].split("/")[1],
				isOffline: false,
				transactionsSynced: false
			}
		},
		methods: {
			navigate(location) {
				this.$router.push(location)

				this.currentRoute = location
				this.pageTitle = this.pagesMeta[location].title
				this.pageIcon = this.pagesMeta[location].icon

				if (window.innerWidth <= 1400)
					this.menuShowing = false
				
			},
			updateAlert(alertData) {
				this.alert = alertData

				let vm = this

				//make notification go away after a few seconds
				setTimeout(function(){
					vm.alert = {
						msg: "",
						class: "",
						visible: false
					}
				},4000)
			},
			showTransactionModal (tran) {
				if (tran)
					this.transactionData = {
						id: tran.id,
						description: tran.description,
						tran_date: tran.tran_date,
						amount: tran.amount,
						account_id: tran.account_id,
						cat_id: tran.cat_id,
						in_out: tran.in_out
					}
				else {

					this.transactionData = {
						description: "",
						tran_date: null,
						amount: "",
						account_id: this.transactionData.account_id,
						cat_id: 0,
						in_out: 0
					}

				}

				this.transactionModalVisible = true;
			},
			hideMenu() {
				if (window.innerWidth < 1050 && this.menuShowing)
					this.menuShowing = false
			},
			closeTransactionModal: function(e) {
				this.transactionModalVisible = false;
			},
			refreshTransactionData() {
				this.fetchBankAccounts()

			},
			showAccountsModal(account) {

				if (typeof account != 'undefined' && "off_budget" in account) {
					this.modalBankAccount.description = account.description
					this.modalBankAccount.off_budget = account.off_budget
					this.modalBankAccount.id = account.id
				}
				else {
					this.modalBankAccount = {
						description: "",
						off_budget: 0,
						reconcile_balance: 0,
						reconcile_date: null
					}
				}
				this.accountModalVisible = true
				
			},	
			beginTransactionImport() {
				let payload = {
					filename: this.fileUpload.responseFilename,
					format: this.fileUpload.fileFormat
				}

				let vm = this

				this.postData(window.apiBase+"import/import-csv-to-pending",payload).then(function(response){
					if (response.status == "success") {
						vm.navigate("/clear-imported-transactions")
						vm.importModalVisible = false
					}
				})
			},
			startUpload(e) {
				this.fileUpload.msg = "Uploading..."
			},
			finishUpload(e){
				
				let response = JSON.parse(e.target.responseText)

				if (response.status == "success") {
					this.fileUpload.msg = "Upload Complete"
					this.fileUpload.responseFilename = response.filename
					this.fileUpload.submitVisible = true
				}
				else {
					this.FileUpload.msg = "There was a problem"
					this.importAlert.visible = true
					this.importAlert.msg = response.errors
					this.importAlert.class = "alert-danger"
				}
				
			},
			uploadProgress(e) {
				// file upload progress
				// returns false if progress is not computable
				this.fileUpload.msg = "Uploading... " + e + "%";
			},
			saveBankAccount () {
				let vm = this

				let payload = {
					off_budget: this.modalBankAccount.off_budget,
					description: this.modalBankAccount.description,
				}

				if (this.reconcileAccount) {
					payload['last_reconciled_balance'] = this.modalBankAccount.reconcile_balance
					payload['last_reconciled'] = this.modalBankAccount.reconcile_date
				}

				if ("id" in this.modalBankAccount)
					payload['id'] = this.modalBankAccount.id

				this.postData(window.apiBase + "bankAccount/save",payload).then(function(response) {

					if ("status" in response && response.status == "offline") {
						vm.isOffline = true
					}
					else if (response.status == "success") {
						vm.accountModalVisible = false
						vm.fetchBankAccounts()
					}
				})
			},
			fetchGroups() {
				let vm = this

				this.getJSON(window.apiBase + "group/get-with-categories/").then(function(response){

					let groups = []
					if (response.status == "success") {
						localStorage.groups = JSON.stringify(response.groups)
						groups = response.groups
					}
					else if (response.status == "offline") {
						groups = JSON.parse(localStorage.groups)
						vm.isOffline = true
					}

					vm.masterGroups = groups
				})
			},
			fetchBankAccounts() {
				let vm = this

				this.getJSON(window.apiBase + "bankAccount/get").then(function(response){

					if ("status" in response && response.status == "offline") {
						vm.isOffline = true
						response = JSON.parse(localStorage.bankAccounts)
					}
					else {
						localStorage.bankAccounts = JSON.stringify(response)
						vm.bankAccounts = response

					}
					if (response) {
						vm.bankAccounts = response
						//preselect first on-budget account
						response.forEach(function(account,index) {
							if (account.off_budget == 0)
								vm.transactionData.account_id = account.id
						})
					}
					
				})
			},
			fetchPendingImports() {
				let vm = this

				this.getJSON(window.apiBase+"import/get").then(function(response){
					
					if ("status" in response && response.status == "offline") {
						vm.isOffline = true
					}
					else if (response.length > 0)
						vm.pagesMeta["/clear-imported-transactions"].nav = true

					else 
						vm.pagesMeta["/clear-imported-transactions"].nav = false
				})
			},
			fetchIncomes() {
				let vm = this

				let d = new Date();

				let filters = [
					['bud_year' , d.getFullYear()],
					['bud_month', d.getMonth() + 1]
				]

				let query = "?filters="+JSON.stringify(filters)

				this.getJSON(window.apiBase + "income/get"+query).then(function(response){
					vm.incomeSources = response
				})
			},
			
		},
		computed: {
			transactionModalVisibleState : function(){
				return this.transactionModalVisible
			},
			masterCategories () {
				//extract categories from mastergroup list
				let categories = []

				this.masterGroups.forEach(function(group, index){
					group.categories.forEach(function(cat, index){
						categories.push(cat)
					})
				})

				return categories
			},
			accountBalanceTotals() {
				let total_off_budget = 0
				let total_on_budget = 0
				this.bankAccounts.forEach(function(account, index) {
					if (account.off_budget == 0) 
						total_on_budget += parseFloat(account.balance)
					else
						total_off_budget += parseFloat(account.balance)
				});

				return {
					offBudget : total_off_budget,
					onBudget: total_on_budget
				}
			}
		},
		created () {
			
			if (window.innerWidth > 1400) {
				this.menuShowing = true
			}

			//check for api key storage
			if ("apiKey" in localStorage) 
				this.loggedIn = true
			else
				window.location = "/login"
			
			this.fetchGroups()
			this.fetchBankAccounts()
			this.fetchPendingImports()
			this.fetchIncomes()
			//this.fetchIncomeTransactions()

			this.pageTitle = this.pagesMeta[this.currentRoute].title
			this.pageIcon = this.pagesMeta[this.currentRoute].icon

			let vm = this

			vm.transactionsSynced = false

			//sync any locally saved transactions from offline use
			if ("transactionsSubmitted" in localStorage) {

				let payload = {
					records: localStorage.transactionsSubmitted
				}

				this.postData(window.apiBase + "transaction/save-batch",payload).then(function(response){

					if (response.status == "success") {
						localStorage.removeItem("transactionsSubmitted")
						vm.transactionsSynced = true

						setTimeout(function(){
							vm.transactionsSynced = false
						},10000)
					}

				})
			}
		}
	}
</script>

<style type="text/css">
	.dashboard {
		
		padding: 1px;
	}

	.section-wrapper {
		margin-top: 40px;
		overflow: hidden;

	}

	.section-outer {
		max-width: 1200px;
		margin: auto;
		background-color: white;
	}

	section {
		padding: 20px;
		margin: auto;
		max-width: 1200px;
		
		margin-bottom: 20px;
		background-color: white;
	}

	h2 {
		margin-top: 0;
	}

	.table {
		margin-bottom: 0;
	}

	.row section {
		margin-bottom: 0;
		padding-bottom: 5px;
	}

	.col-amounts {
		width: 100px;
	}

	.icon-button {
		font-size: 22px;
		cursor: pointer;
	}

	.icon-button:hover {
		opacity: 0.8;
	}

	.icon-button.fa-remove {
		color: #b70000;
	}

	.icon-button.fa-plus {
		color: green;
	}

	.alert {
		margin-bottom: 5px;
	}

	.bg-outflows {
		background-color: #fce8e3;
	}

	input[type=number], td.number, th.number {
		text-align: right;
	}

	.table>tbody>tr>td.td-indent {
		padding-left: 15px;
	}

	tbody>tr>td.has-control, tbody>tr>th.has-control {
		padding-top: 1px;
		padding-bottom: 1px;
	}

	td.btn-col, th.btn-col {
		width: 30px;
	}

	thead .btn-col {
		width: 60px;
	}

	.table>thead>tr>th, .table>thead>tr>td, .table>tbody>tr>td {
		vertical-align: middle;
	}

	.table .fa-remove:hover {
		color: red;
	}

	tr:hover .fa-remove {
		display: inline-block;
	}

	.col2-control {
		width: calc(50% - 2px);
		display: inline-block;
	}

	/* FILE UPLOAD ***************************/

	.dropbox {
		outline: 2px dashed grey; /* the dash box */
		outline-offset: -10px;
		background: lightcyan;
		color: dimgray;
		padding: 10px 10px;
		min-height: 60px; /* minimum height */
		position: relative;
		cursor: pointer;
		margin-bottom: 10px;
	}

	.input-file {
		opacity: 0; /* invisible but it's there! */
		width: calc(100% - 20px);
		height: 95px;
		position: absolute;
		cursor: pointer;
	}

	.dropbox:hover {
		background: lightblue; /* when mouse over to the drop zone, change color */
	}

	.dropbox p {
		font-size: 1.2em;
		text-align: center;
		padding: 30px 0;

	}

	/* END FILE UPLOAD **************************/

	@media (max-width: 1200px) {
		.section-wrapper.menuShowing {
			margin-left: 0;
		}
	}

	@media (max-width: 500px) {
		section {
			padding: 10px;
		}

		.col2-control {
			display: block;
			width: 100%;
		}

		.vdp-datepicker {
			display: block;
			width: 100%;
		}
	}
</style>