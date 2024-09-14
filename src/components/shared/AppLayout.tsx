import Footer from "@/components/shared/Footer";

const AppLayout: React.FC<AppLayoutProps> = ({ navigation, local }) => {
  return <Footer navigation={navigation} local={local} />;
};

export default AppLayout;
