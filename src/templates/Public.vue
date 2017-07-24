<template>
	<div>
		<Login v-if="currentRoute == 'login' || currentRoute == 'logout'"></Login>
		<ResetPassword v-if="currentRoute == 'reset-password'"></ResetPassword>
	</div>
</template>

<script type="text/javascript">
	import Login from '../pages/Login'
	import ResetPassword from '../pages/ResetPassword'

	export default {
		name: 'Public',
		components: {
			Login,
			ResetPassword
		},
		data () {
			return {
				routeParams: this.$route.params
			}
		},
		computed: {
			currentRoute() {
				let segments = this.$route.fullPath.split("/")
				let first_segment = segments[1]
				return first_segment
			}

		}
		
	}
</script>
