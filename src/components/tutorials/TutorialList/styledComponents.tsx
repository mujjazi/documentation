import { Box, Button, Chip, Paper, styled } from '@mui/material'
import { grey } from '@mui/material/colors'

export const Grid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minMax(390px, 1fr))',
  columnGap: theme.spacing(2),
  rowGap: theme.spacing(2),
  gridAutoRows: 'minMax(240px, 1fr)',
}))

export const Card = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  flexDirection: 'column',
  height: '100%',
  width: '100%',
}))

export const Title = styled(Box)(({ theme }) => ({
  fontSize: theme.typography.h5.fontSize,
}))

export const Topic = styled(Chip)(({ theme }) => ({
  color: '#2F1A55',
  backgroundColor: '#D4C7EB',
  borderRadius: '4px',
  height: '25px',
  fontSize: 'label',
}))

export const Description = styled(Box)(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  marginBottom: theme.spacing(2),
}))

export const shadow =
  '0px 0px 2px 0px rgba(16, 24, 40, 0.06), 0px 1px 3px 0px rgba(16, 24, 40, 0.1);'

export const StartButton = styled(Button)(({ theme }) => ({
  color: '#1D2939',
  textTransform: 'none',
  border: '1px solid ' + grey[300],
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}))
