import { Navigate, Outlet } from "react-router-dom";
import { getCookie } from "../helpers/cookies.helper";
function PrivateRoutes() {
    const token = getCookie("token");
    console.log("PrivateRoutes - token:", token);
    return (
        <>
            {
                (token) ? (<Outlet />) : (<Navigate to="/login" />)
            }
        </>
    )
}
export default PrivateRoutes;
