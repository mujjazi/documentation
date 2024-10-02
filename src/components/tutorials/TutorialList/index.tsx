import React from 'react'
import { useHistory } from '@docusaurus/router'
import Layout from '@theme/Layout'

import {
  Box,
  FormControl,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
  Grid,
} from '@mui/material'
import { grey } from '@mui/material/colors'
import { ChevronRight, Search } from '@mui/icons-material'

import {
  Card,
  Title,
  Topic,
  Description,
  StartButton,
  shadow,
} from './styledComponents'
import { Tutorial, Meta, Topic as TopicType } from '../models'
import { Grid as TutorialGrid } from './styledComponents'

function TutorialCard({ tutorial }: { tutorial: Meta }) {
  const history = useHistory()

  return (
    <Card>
      <Title>{tutorial.title}</Title>
      <Topic label={tutorial.label} sx={{ mb: 2 }}></Topic>
      <Description>{tutorial.description}</Description>
      <StartButton
        onClick={() => history.push(`/tutorials/${tutorial.id}`)}
        endIcon={<ChevronRight />}
      >
        Start Learning
      </StartButton>
    </Card>
  )
}

function Header() {
  return (
    <Box>
      <Typography fontWeight={500} variant="h4" component="h2" sx={{ mb: 1 }}>
        Tutorials & Guides
      </Typography>

      <p>
        Step-by-step instructions and expert tips to help you master new skills
        and navigate through complex tasks.
      </p>
    </Box>
  )
}

function searchFilter(term: string, tutorial?: Tutorial): boolean {
  return tutorial
    ? tutorial?.meta.title.toLowerCase().includes(term.toLowerCase())
    : false
}

function topicFilter(topic: TopicDropdown, tutorial?: Tutorial): boolean {
  if (!tutorial) return false
  if (topic === 'All topics') return true
  return tutorial ? tutorial?.meta.label === topic : false
}

type TopicDropdown = keyof typeof TopicType.Values | 'All topics'
const TopicDropdownValues: TopicDropdown[] = [
  'All topics',
  ...Object.values(TopicType.Values),
]

function TutorialList({ tutorials }: { tutorials: Record<string, unknown> }) {
  const [search, setSearch] = React.useState('')
  const [topic, setTopic] = React.useState<TopicDropdown>('All topics')
  const [parsedTutorials, setParsedTutorials] = React.useState<Tutorial[]>([])

  React.useEffect(() => {
    setParsedTutorials(
      Object.values(tutorials).map((data) => Tutorial.parse(data))
    )
  }, [tutorials])

  return (
    <Layout>
      <Box paddingX={5} paddingY={4}>
        <Header />
        <Grid container columnSpacing={2}>
          <Grid item>
            <FormControl
              variant="outlined"
              sx={{
                width: '22rem',
                mb: 4,
              }}
            >
              <OutlinedInput
                sx={{
                  backgroundColor: 'white',
                  color: grey[800],
                  boxShadow: shadow,
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <Search
                      sx={{
                        color: 'rgba(102, 56, 184, 1)',
                      }}
                    />
                  </InputAdornment>
                }
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name of the tutorial or guide..."
              />
            </FormControl>
          </Grid>

          {/* Dropdown for filtering by topic */}
          <Grid item>
            <FormControl
              variant="outlined"
              sx={{
                border: grey[300],
                boxShadow: shadow,
                width: '12rem',
                mb: 4,
                transformOrigin: 'top',
                // Dropdowns are very slightly bigger than the search bar, so scale down
                transform: 'scale(0.95)',
              }}
            >
              <Select
                sx={{
                  backgroundColor: 'white',
                  color: grey[800],
                }}
                value={topic}
                onChange={(e) => setTopic(e.target.value as TopicDropdown)}
              >
                {TopicDropdownValues.map((topic) => (
                  <MenuItem key={topic} value={topic}>
                    {topic}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TutorialGrid mb={2}>
          {parsedTutorials
            .filter((tutorial: Tutorial) => searchFilter(search, tutorial))
            .filter((tutorial: Tutorial) => topicFilter(topic, tutorial))
            .map((tutorial: Tutorial) => (
              <TutorialCard key={tutorial.meta.id} tutorial={tutorial.meta} />
            ))}
        </TutorialGrid>
      </Box>
    </Layout>
  )
}

export default TutorialList
