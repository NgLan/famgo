import { Outlet } from "react-router-dom";

function ClientMain() {
  return (
    <main style={{ width: '100%' }}>
      <Outlet />
    </main>
  );
}

export default ClientMain;
