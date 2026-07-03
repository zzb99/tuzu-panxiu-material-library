import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ResourceListView from '../views/ResourceListView.vue'
import ResourceDetailView from '../views/ResourceDetailView.vue'
import AboutView from '../views/AboutView.vue'
import { resources } from '../config/resources'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  ...resources.flatMap(resource => [
    { path: `/${resource.path}`, name: resource.path, component: ResourceListView, props: { type: resource.type } },
    { path: `/${resource.path}/:id(\\d+)`, name: `${resource.path}-detail`, component: ResourceDetailView, props: { type: resource.type } },
  ]),
  { path: '/about', name: 'about', component: AboutView },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
