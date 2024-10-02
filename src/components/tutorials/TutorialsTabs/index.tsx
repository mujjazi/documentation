import React, { useEffect } from 'react'

import { useHistory, useLocation } from '@docusaurus/router'
import { Tab, Tabs } from '@mui/material'

enum DocsTab {
  Docs = '/docs',
  Tutorials = '/tutorials',
}

function getCurrentTab(pathname: string): DocsTab {
  return pathname.startsWith(DocsTab.Tutorials)
    ? DocsTab.Tutorials
    : DocsTab.Docs
}

export default function DocsTutorialsTabs(): JSX.Element {
  const history = useHistory()
  const location = useLocation()
  const [tab, setTab] = React.useState<DocsTab>(() =>
    getCurrentTab(location.pathname)
  )

  useEffect(() => {
    setTab(getCurrentTab(location.pathname))
  }, [location.pathname])

  const handleChange = (_e: React.SyntheticEvent, newValue: DocsTab) => {
    history.push(newValue)
    setTab(newValue)
  }

  return (
    <Tabs
      onChange={handleChange}
      value={tab}
      TabIndicatorProps={{ sx: { height: '6px', transition: 'none' } }}
    >
      <Tab value={DocsTab.Docs} label="Docs" />
      <Tab value={DocsTab.Tutorials} label="Tutorials" />
    </Tabs>
  )
}
