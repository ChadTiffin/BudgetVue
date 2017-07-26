<template>
	<header>
		<div class="page-heading" :class="{ menuShowing: menuShowing }">
			<div class="menu-button" v-on:click="toggleMenu"><i class="fa fa-navicon"></i></div>
			<h1><i class='fa' :class="pageIcon"></i> {{pageTitle}}</h1>

			<transition
			name="offlineNoticeShowHide"
			enter-active-class="zoomIn"
			leave-active-class="zoomOut" >
				<div v-show="isOffline" class="offline-flag header-flag">
					<i class="fa fa-plug"></i>
					<span>You are Offline</span>
				</div>
			</transition>

			<transition
			name="syncNoticeShowHide"
			enter-active-class="zoomIn"
			leave-active-class="zoomOut" >
				<div v-show="transactionsSynced" class="header-flag transactions-synced-flag">
					<i class="fa fa-cloud"></i>
					<span>Transactions synced</span>
				</div>
			</transition>
		</div>

		<nav class="menu" :class="{ menuShowing: menuShowing }">

			<h2 
				class="menu-heading menu-button-heading" 
				v-on:click="menuButtonsCollapsed ? menuButtonsCollapsed = false : menuButtonsCollapsed = true">		
				Menu 
				<i class="fa pull-right" :class="{'fa-caret-down' : menuButtonsCollapsed, 'fa-caret-up' : !menuButtonsCollapsed}"></i>
			</h2>
			<ul class="menu-list" v-if="!menuButtonsCollapsed">
				<li><a href="#" v-on:click.prevent="showModal"><i class="fa fa-fw fa-plus"></i> New Transaction</a></li>

				<li v-if="!isOffline"><a href="#" v-on:click.prevent="showImportModal"><i class="fa fa-fw fa-download"></i> Import Transactions</a></li>

				<li v-if="(!isOffline && page.nav) || (isOffline && page.offlinePage)"
					v-for="(page, key) in pagesMeta" >
					<a :href="key" v-on:click.prevent="navigate(key)"><i class="fa fa-fw" :class="page.icon"></i> {{ page.title }}</a>
				</li>

				<li v-if="!isOffline"><a href="/login"><i class="fa fa-fw fa-sign-out"></i> Logout</a></li>
			</ul>

			<div class="bank-accounts-wrapper">
				<i class="pull-right fa fa-plus icon-button" v-on:click="showAccountsModal"></i>
				<h2 class="menu-heading">Bank Accounts</h2>

				<h3>On-Budget</h3>

				<ul class="bank-accounts">
					<li class="account" 
						v-for="account in bankAccounts"
						v-if="account.off_budget == 0"
						v-on:mouseover="account.editButtonVisible = true" 
						v-on:mouseleave="account.editButtonVisible = false"
						v-on:click="showAccountsModal(account)">
						<i class="fa fa-pencil" v-if="account.editButtonVisible == true"></i>
						{{ account.description }}: <div class="bank-balance" :class="{ 'text-danger' : account.balance < 0, 'text-success': account.balance >= 0 }">$ {{ account.balance }}</div>
					</li>
					
					<li class="total">Total <div class="bank-balance">$ {{ accountBalanceTotals.onBudget.toFixed(2) }}</div></li>
				</ul>

				<h3>Off-Budget</h3>

				<ul class="bank-accounts">
					<li class="account" 
						v-for="account in bankAccounts"
						v-if="account.off_budget == 1"
						v-on:mouseover="account.editButtonVisible = true" 
						v-on:mouseleave="account.editButtonVisible = false"
						v-on:click="showAccountsModal(account)">
						<i class="fa fa-pencil" v-if="account.editButtonVisible == true"></i>
						{{ account.description }}: <div class="bank-balance" :class="{ 'text-danger' : account.balance < 0, 'text-success': account.balance >= 0 }>$ {{ account.balance }}</div>
					</li>
					
					<li class="total">Total <div class="bank-balance">$ {{ accountBalanceTotals.offBudget.toFixed(2) }}</div></li>
				</ul>
			</div>
		</nav>
		<div class="alert main-alert" :class="alert.class" v-if="alert.visible">
			{{ alert.msg }}
			<p v-if="alert.errors">{{ alert.errors }}</p>
		</div>
	</header>
</template>

<script type="text/javascript">

	export default {
		name: 'DashboardHeader',
		props: ['menuShowing','spinnerVisible','pageTitle','pageIcon','bankAccounts','pagesMeta','accountBalanceTotals','isOffline','transactionsSynced','alert'],
		data () {
			return {
				menuButtonsCollapsed: false
			}
		},
		computed: {
			localBankAccounts () {
				let localBankAccounts = []
				let vm = this

				this.bankAccounts.forEach(function(account, index) {

					if (!("editButtonVisible" in account)) {
						vm.$set(account,'editButtonVisible',false)
					}

					localBankAccounts.push(account)
				});

				return localBankAccounts
			}
		},
		methods: {
			toggleMenu: function(e) {
				this.$emit("toggleMenu");
			},
			showModal: function(e) {
				this.$emit("showModal");
			},
			showImportModal () {
				this.$emit("showImportModal")
			},
			showAccountsModal (account) {
				this.$emit("showAccountsModal",account)
			},
			navigate(location) {
				this.$emit("navigate",location)
			},
			logout () {
				localStorage.removeItem("apiKey");
			}
		}
	}
</script>

<style type="text/css" >
	.section-wrapper.menuShowing {
		margin-left: 250px;
	}

	.page-heading {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		background-color: rgba(20,15,10,1);
		background-color: #003540;
		color: #fff;
		padding: 5px;
		transition: left 0.5s;
		min-width: 320px;
		z-index: 11;
	}

	.page-heading.menuShowing {
		left: 250px;
		
	}

	.page-heading h1 {
		display: inline-block;
		vertical-align: top;
		margin: 0;
		margin-top: 5px;
		margin-left: 20px;
		font-size: 22px;

	}

	.header-flag {
		position: absolute;
		top: 5px;
		right: 5px;
		padding: 5px;
		border-radius: 4px;
	}

	.offline-flag {
		background-color: #ff4747;
		color: white;
	}

	.transactions-synced-flag {
		background-color: #4CB050;
		color: white;
	}

	.menu {
		width: 250px;
		padding: 10px;
		padding-top: 0;
		background-color: rgba(20,15,10,1);
		background-color: #003540;
		color: #fff;
		position: fixed;
		top: 0;
		left: -250px;
		bottom: 0;
		overflow-y: auto;
		transition: left 0.5s;
		z-index: 10;
	}



	.menu-button-heading {
		cursor: pointer;
		background-color: #03A9F4;
		padding: 12.5px;
		text-decoration: none;
		margin-left: -10px;
		margin-right: -10px;
		margin-top: 0;
	}

	.menu-button-heading:hover {
		opacity: 0.8
	}

	.menu.menuShowing {
		left: 0;
	}

	.menu-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	header nav h2 {
		font-size: 12pt;
		text-transform: uppercase;
		margin-top: 20px;
		text-decoration: underline;
	}

	header nav h3 {
		font-size: 11pt;
		text-transform: uppercase;
		margin-top: 20px;
	}

	.menu li a {
		color: #fff;
		display: block;
		padding: 5px;
		text-decoration: none;
		font-size: 18px;
		transition: transform 0.2s;
	}

	.menu li a:hover {
		text-decoration: none;
		color: white;
		background-color: rgba(255,255,255,0.1);
		transform: scale(1.05, 1.05);
	}

	.menu-button {
		font-size: 32px;
		cursor: pointer;
		display: inline-block;
		line-height: 0;
	}

	.menu .menu-button {
		float: right;
	}

	.bank-accounts {
		list-style: none;
		padding: 0;
	}

	.bank-balance {
		text-align: right;
		float: right;
	}

	.bank-accounts li {
		padding-top: 2px;
		padding-bottom: 2px;
		transition: transform 0.2s;
	}

	.bank-accounts .account:hover {
		background-color: rgba(255,255,255,0.1);
		transform: scale(1.03, 1.03);
		cursor: pointer;
	}

	.bank-accounts .total {
		border-top: 1px solid #a0a0a0;
		margin-top: 5px;
	}

	header .icon-button.fa-plus {
		color: #fff;
		margin-top: -3px;
	}

	header .text-danger {
		color: #fd5757;
	}

	header .text-success {
		color: #60ef62;
	}

	.main-alert {
		position: fixed;
		top: 5px;
		right: 5px;
		z-index: 50
	}

	@media (max-width: 1050px) {
		.section-wrapper.menuShowing {
			margin-left: 0;
		}
	}

	@media (max-width: 450px) {
		.header-flag span {
			display: none;
		}
	}
</style>