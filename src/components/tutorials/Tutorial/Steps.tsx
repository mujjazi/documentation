import React from 'react'
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
import { grey, green } from '@mui/material/colors'
import { MDXContent } from '../models'

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

export default function Steps({
  steps,
  activeStep,
  setActiveStep,
}: {
  steps: MDXContent[]
  activeStep: number
  setActiveStep: (step: number) => void
}) {
  return (
    <Paper>
      <Box sx={{ paddingX: 2, paddingY: 1 }}>
        <List dense>
          {steps.map((step, i) => (
            <ListItem
              key={step.frontMatter.position}
              onClick={() => setActiveStep(i)}
              sx={{
                borderRadius: 1,
                marginY: 1,
                backgroundColor:
                  steps[activeStep] === step ? grey[200] : 'white',
                color: steps[activeStep] === step ? 'primary.main' : 'black',
              }}
            >
              <ListItemIcon
                sx={{ minWidth: '30px' /* Move the text closer to the icon */ }}
              >
                <ListIcon
                  selfPosition={step.frontMatter.position}
                  activePosition={steps[activeStep].frontMatter.position}
                />
              </ListItemIcon>
              <ListItemText>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight:
                      step.frontMatter.position <
                      steps[activeStep]?.frontMatter.position
                        ? 'bold'
                        : 'normal',
                  }}
                >
                  {step.frontMatter.title}
                </Typography>
              </ListItemText>
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  )
}
