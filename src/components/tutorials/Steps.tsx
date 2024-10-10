import React, { useEffect, useRef } from 'react'

import LastUpdated from '@theme/LastUpdated'
import { green, grey } from '@mui/material/colors'
import { useHistory, useLocation } from '@docusaurus/router'
import { CheckCircleOutline, CircleOutlined } from '@mui/icons-material'
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material'

import { Step } from '../models'

function ListIcon({
  selfPosition,
  activePosition,
}: {
  selfPosition: number
  activePosition: number
}): JSX.Element {
  if (selfPosition === activePosition) {
    return <CircleOutlined sx={{ color: 'primary.main' }} />
  } else if (selfPosition < activePosition) {
    return <CheckCircleOutline sx={{ color: green[600] }} />
  } else {
    return <CircleOutlined />
  }
}

export function stepToHistory(step: Step): string {
  let path = step.path.split('/')
  let [_, tutorial, file] = path
  file = file === 'index.md' ? '' : file.replace('.md', '')

  return `/tutorials/${tutorial}/${file}`
}

export default function Steps({ steps }: { steps: Step[] }) {
  const location = useLocation()
  const history = useHistory()
  const [lastUpdated, setLastUpdated] = React.useState<number>(0)
  const [activeStep, setActiveStep] = React.useState<Step>(() => {
    const locationSplit = location.pathname.split('/')
    const stepName = locationSplit[locationSplit.length - 1].replace('.md', '')
    const step = steps.find((step) => step.path.includes(stepName))

    if (!step) {
      return steps[0]
    }

    return step
  })

  useEffect(() => {
    const element = document.getElementById('lastUpdated')
    if (element) {
      setLastUpdated(parseInt(element.textContent || '0'))
    } else {
      // Set up mutation observer to wait for the id
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mut) => {
          if (!mut.addedNodes) {
            return
          }
          for (let node of Object.values(mut.addedNodes)) {
            if (node instanceof HTMLElement && node.id === 'lastUpdated') {
              setLastUpdated(parseInt(node.textContent || '0'))
              observer.disconnect()
            }
          }
        })
      })
    }
  }, [])

  return (
    <Paper sx={{ height: 'fit-content' }}>
      <Box sx={{ paddingX: 2, paddingY: 1 }}>
        <List dense>
          {steps.map((step, i) => (
            <ListItem
              key={step.position}
              onClick={() => {
                history.push(stepToHistory(step))
                setActiveStep(step)
              }}
              sx={{
                cursor: 'pointer',
                borderRadius: 1,
                marginY: 1,
                backgroundColor:
                  activeStep.position === step.position ? grey[200] : 'white',
                color:
                  activeStep.position === step.position
                    ? 'primary.main'
                    : 'black',
              }}
            >
              <ListItemIcon
                sx={{ minWidth: '30px' /* Move the text closer to the icon */ }}
              >
                <ListIcon
                  selfPosition={step.position}
                  activePosition={activeStep.position}
                />
              </ListItemIcon>
              <ListItemText>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight:
                      step.position < activeStep?.position ? 'bold' : 'normal',
                  }}
                >
                  {step.title}
                </Typography>
              </ListItemText>
            </ListItem>
          ))}
        </List>
        <Box sx={{ pl: 2 }}>
          <LastUpdated lastUpdatedAt={lastUpdated} />
        </Box>
      </Box>
    </Paper>
  )
}
