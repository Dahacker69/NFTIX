import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Sort from './components/Sort'
import Card from './components/Card'
import SeatChart from './components/SeatChart'

// ABIs
import NFTix from './abis/NFTix.json'  // Updated to import the new contract ABI

// Config
import config from './config.json'

function App() {
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)

  const [nftix, setNFTix] = useState(null)  // Renamed from tokenMaster to nftix
  const [occasions, setOccasions] = useState([])

  const [occasion, setOccasion] = useState({})
  const [toggle, setToggle] = useState(false)

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    const network = await provider.getNetwork()
    const nftix = new ethers.Contract(config[network.chainId].NFTix.address, NFTix, provider)  // Updated to use NFTix
    setNFTix(nftix)  // Renamed from tokenMaster to nftix

    const totalOccasions = await nftix.totalOccasions()  // Renamed to nftix
    const occasions = []

    for (var i = 1; i <= totalOccasions; i++) {
      const occasion = await nftix.getOccasion(i)  // Renamed to nftix
      occasions.push(occasion)
    }

    setOccasions(occasions)

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account)
    })
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div>
      <header>
        <Navigation account={account} setAccount={setAccount} />

        <h2 className="header__title"><strong>Event</strong> Tickets</h2>
      </header>

      <Sort />

      <div className='cards'>
        {occasions.map((occasion, index) => (
          <Card
            occasion={occasion}
            id={index + 1}
            nftix={nftix}  // Renamed from tokenMaster to nftix
            provider={provider}
            account={account}
            toggle={toggle}
            setToggle={setToggle}
            setOccasion={setOccasion}
            key={index}
          />
        ))}
      </div>

      {toggle && (
        <SeatChart
          occasion={occasion}
          nftix={nftix}  // Renamed from tokenMaster to nftix
          provider={provider}
          setToggle={setToggle}
        />
      )}
    </div>
  );
}

export default App;
