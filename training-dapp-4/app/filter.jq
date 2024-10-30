"VITE_CONTRACT_ADDRESS=" + last(.tasks[] | select(.task == "deploy" and .output[0].contract == "proxy.tz").output[0].address)
