import {Navigate} from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

// هذه الفاكشن تحمي الصفحات وتوجّه المستخدم حسب دوره.
// تاخذ براميتر "children" وهي الصفحة اللي استدعتها بكامل محتوياتها,
// وتاخد بعد "Role" عشان تتحقق من أن المستخدم يملك الصلاحية
// عشان يدخل لهذي الصفحة


function ProtectedRoute({children,Role}) {
    const token=localStorage.getItem("token");

    if(!token){
        return <Navigate to="/login" replace />;
    }

    try {
        const decodedToken=jwtDecode(token)

        if(decodedToken.role !== Role){
            return <Navigate to="/login" replace />;
            
        }
        return children;
    }catch (error) {
        return <Navigate to="/login" replace />;
    }
}

export default ProtectedRoute;