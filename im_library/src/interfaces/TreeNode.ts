import {getColourFromType, getFAIconFromType} from '../helpers/ConceptTypeMethods';

export interface TreeNode {
  key: string
  label: string
  typeIcon: string[]
  color: string
  data: any
  leaf: boolean
  loading: boolean
  children: TreeNode[]
  order?: number
}
