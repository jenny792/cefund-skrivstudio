import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Sources from './pages/Sources'
import Generate from './pages/Generate'
import Posts from './pages/Posts'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="kallor" element={<Sources />} />
        <Route path="generera" element={<Generate />} />
        <Route path="inlagg" element={<Posts />} />
      </Route>
    </Routes>
  )
}
