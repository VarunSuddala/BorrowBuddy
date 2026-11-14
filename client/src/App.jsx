import './App.css'
import AppView from './components/AppView'
import useBorrowBuddyApp from './hooks/useBorrowBuddyApp'

function App() {
  const app = useBorrowBuddyApp()
  return <AppView app={app} />
}

export default App
