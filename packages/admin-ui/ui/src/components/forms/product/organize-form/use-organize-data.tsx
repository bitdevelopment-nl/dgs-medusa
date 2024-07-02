import { useMemo } from "react"

import {
  useAdminCollections,
  useAdminProductCategories,
  useAdminProductTypes,
} from "medusa-react"

import { NestedMultiselectOption } from "../../../../domain/categories/components/multiselect"
import { transformCategoryToNestedFormOptions } from "../../../../domain/categories/utils/transform-response"
import {
  FeatureFlag,
  useFeatureFlag,
} from "../../../../providers/feature-flag-provider"

const useOrganizeData = () => {
  const { isFeatureEnabled } = useFeatureFlag()
  const { product_types } = useAdminProductTypes(undefined, {
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
  const { collections } = useAdminCollections()
  const { product_categories: categories = [] } = useAdminProductCategories(
    {
      parent_category_id: "null",
      include_descendants_tree: true,
    },
    {
      enabled: isFeatureEnabled(FeatureFlag.PRODUCT_CATEGORIES),
    }
  )

  const categoriesOptions: NestedMultiselectOption[] | undefined = useMemo(
    () => categories?.map(transformCategoryToNestedFormOptions),
    [categories]
  )

  return {
    categoriesOptions,
  }
}

export default useOrganizeData
