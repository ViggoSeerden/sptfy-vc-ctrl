import { faFlag, faFlagUsa } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

function TabBar() {
    return (
        <div className="tabbar">
            <div className="footer">
                <table width="100%" className="tabbarspaces">
                    <tbody>
                        <tr>
                            <td className="td"><Link className="link" to="/"><FontAwesomeIcon icon={faFlag} color="white"/> <br/> NL</Link></td>
                            <td className="td"><Link className="link" to="/en"><FontAwesomeIcon icon={faFlagUsa} color="white"/> <br/> EN</Link></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TabBar;