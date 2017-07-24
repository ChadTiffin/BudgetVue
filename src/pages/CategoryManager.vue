<template>

	<section>

		<div class="alert pull-right" :class="alert.class" v-if="alert.visible">{{ alert.msg }}</div>

		<p><button class="btn btn-success" v-on:click="addGroup"><i class="fa fa-plus"></i> New Group</button></p>

		<div style="clear: both;"></div>

		<ul class="list-group">
			<draggable v-model="localGroups" v-on:update="autoSave(localGroups,'budget','save-order')" :options="{handle: '.sort-row'}" >
				<li class="list-group-item" v-for="group in localGroups" v-if="group.name != 'Surplus'">
					
					<i class="fa fa-fw fa-remove icon-button pull-right" v-on:click="deleteItem('group',group.id)"></i>

					<i class="fa fa-fw fa-arrows sort-row icon-button"></i>
					<i class="fa fa-fw fa-plus icon-button" v-on:click="addCategory(group)"></i>

					<div class="control-wrapper" v-if="group.descEditable" >
						<input type="text" name="name" placeholder="[Group Name]" 
							class="form-control"
							v-on:change="autoSave(group,'group','save')"
							v-on:blur="group.descEditable = false"
							v-model="group.name">
					</div>

					<span class="group-label" v-else v-on:click="group.descEditable = true"> {{ group.name }}</span>

					<ul class="list-group" v-if="group.categories.length > 0">
						<li class="list-group-item" v-for="cat in group.categories">
							<i class="fa fa-fw fa-remove icon-button pull-right" v-on:click="deleteItem('category',cat.id)"></i>

							<div class="control-wrapper" v-if="cat.descEditable">
								<input type="text" name="description" placeholder="[Category Description]" 
									class="form-control"
									v-on:change="autoSave(cat,'category','save')"
									v-on:blur="cat.descEditable = false"
									v-model="cat.description">
							</div>
							<span v-else v-on:click="cat.descEditable = true">{{cat.description}}</span>
						</li>
					</ul>
				</li>
			</draggable>
		</ul>

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
	import draggable from 'vuedraggable'
	import Spinner from '../components/Spinner'
	import ModalDialog from '../components/ModalDialog'

	export default {
		name: "CategoryManager",
		props: ['groups','fetchGroups'],
		components: {
			draggable,
			Spinner,
			ModalDialog
		},
		created () {
			this.localGroups = this.groups
		},
		data () {
			return {
				spinnerVisible: false,
				localGroups: [],
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
				}
			}
		},
		watch: {
			//groups is the authoritative model that gets passed in, localGroups is the state of the model on this page only
			groups() {
				this.localGroups = this.groups

				let vm = this
				this.localGroups.forEach(function(group, index) {
					vm.$set(group,'descEditable',false)

					group.categories.forEach(function(cat, index) {
						vm.$set(cat, 'descEditable', false)
					})
				})
			} 
		},
		methods: {
			deleteItem (resource,item_id) {
				let vm = this;

				let payload = {
					id : item_id
				}

				this.postData(window.apiBase + resource + "/delete",payload).then(function(response) {
					if (response.status == 'success') {
						vm.fetchGroups()
					}
				})
			},
			addGroup () {
				this.localGroups.unshift({
					name: "[New Group]",
					categories: [],
					descEditable: false,
					priority: 0
				})
			},
			addCategory(group) {
				group.categories.unshift({
					description: "[New Category]",
					descEditable: false,
					group_id: group.id
				})
			},
			deleteItem(resource,item_id, executeFunction) {
				this.confirmDialog.title = "Delete"
				this.confirmDialog.message = "Are you sure you want to delete this?"
				this.confirmDialog.successFunction = "executeDelete"
				this.confirmDialog.buttonText = "Delete"
				this.confirmDialog.parameters = {
					resource: resource,
					id: item_id
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

						vm.$emit("fetchGroups")
					}
					else {
						vm.alert.class = "alert-danger"
						vm.alert.visible = true
						vm.alert.msg = response.msg

					}
					
				})
			},
			autoSave(data, resource, method) {
				let vm = this

				let payload = {}

				if (method == 'save') {
					if (resource == 'category') {
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
				}
				else if (method == 'save-order') {
					let type = "groups"
					let list = []
					let id_key = 'id';

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

				this.alert.msg = "Saving..."
				this.alert.class = "alert-warning"
				this.alert.visible = true

				this.postData(window.apiBase + resource + "/" + method, payload).then(function(response){

					if (response.status == 'success') {
						vm.alert.class = 'alert-success'

						//update id that was sent down in case of a create
						data.id = response.id

						let d = new Date()
						vm.alert.msg = "Saved at "+d.getHours() + ":" +d.getMinutes()+ ":"+d.getSeconds()
					}
				})
			},
			confirmationDialogResponse (response) {
				if (response) {
					this[this.confirmDialog.successFunction](this.confirmDialog.parameters)
				}
				this.confirmDialog.visible = false
			},
		}
	}
</script>

<style type="text/css" scoped>
	.list-group-item .list-group {
		margin-top: 15px;
		margin-left: 40px;
		margin-bottom: 5px;
	}

	.list-group-item .list-group .list-group-item {
		padding: 5px;
	}

	.group-label {
		margin-left: 10px;
		display: inline-block;
		font-weight: bold;
	}

	.control-wrapper {
		display: inline-block;
		width: calc(100% - 100px);
	}

	.list-group-item .list-group .control-wrapper {
		width: calc(100% - 50px);
	}

	@media (max-width: 500px) {
		.list-group-item .list-group {
			margin-left: 10px;
		}

		.list-group-item {
			padding-left: 3px;
			padding-right: 8px;
		}
	}
</style>

