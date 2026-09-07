import type { NavigatorScreenParams } from '@react-navigation/native';

export type MarketplaceStackParamList = {
  MarketplaceList: undefined;
  MarketplaceDetail: { productId: string };
  MarketplaceConfirmation: undefined;
};

export type ShopTabsParamList = {
  TopBrands: undefined;
  NearbyStores: undefined;
  Marketplace: NavigatorScreenParams<MarketplaceStackParamList>;
};